import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSaldoReal } from '../utils/blockchain';
const { verifySession } = require('./_lib/session');

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Método no permitido' });
    }

    // ✅ exige sesión
    const session = verifySession(req.headers.cookie?.match(/fn_session=([^;]+)/)?.[1]);
    if (!session) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const {
      cantidadWLD,
      tipo,
      montoQ,
      nombre,
      banco,
      cuenta,
      tipoCuenta,
      telefono,
    } = req.body || {};

    if (
      typeof cantidadWLD !== 'number' ||
      cantidadWLD <= 0 ||
      !tipo ||
      typeof montoQ !== 'number' ||
      montoQ <= 0
    ) {
      return res.status(400).json({ ok: false, error: 'Datos incompletos' });
    }

    const usuarioID = session.sub as string;

    // 📌 Buscar wallet en supabase
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('wallet_address')
      .eq('usuario_id', usuarioID)
      .single();

    if (userError || !usuario) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    // ✅ Verificar saldo real en blockchain
    const saldoReal = await getSaldoReal(usuario.wallet_address, () => {});
    if (saldoReal < cantidadWLD) {
      return res.status(400).json({ ok: false, error: 'Saldo insuficiente (on-chain)' });
    }

    // token único
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // registrar transacción
    const { error: insertError } = await supabase.from('transacciones').insert({
      usuario_id: usuarioID,
      tipo,
      wld_cambiados: cantidadWLD,
      monto_q: montoQ,
      token,
      nombre: tipo === 'bancaria' ? nombre || null : null,
      banco: tipo === 'bancaria' ? banco || null : null,
      cuenta: tipo === 'bancaria' ? cuenta || null : null,
      tipo_cuenta: tipo === 'bancaria' ? tipoCuenta || null : null,
      telefono: tipo === 'cajero' ? telefono || null : null,
      estado: "pendiente",
      created_at: new Date(),
    });

    if (insertError) {
      return res.status(500).json({ ok: false, error: 'Error registrando transacción' });
    }

    // 🚀 Respuesta siempre en JSON
    return res.status(200).json({ ok: true, token, saldoReal });

  } catch (e: any) {
    console.error("❌ Error inesperado en /api/transferir:", e);
    return res.status(500).json({ ok: false, error: 'Error en el servidor', details: e.message });
  }
}
