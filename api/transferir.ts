// api/transferir.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSaldoReal } from '../utils/blockchain';

const { verifySession } = require('./_lib/session');

function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || '';
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: 'unauthorized' });
  if (String(session.lvl).toLowerCase() !== 'orb') {
    return res.status(403).json({ error: 'verification_level_not_allowed' });
  }

  try {
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

    console.log("📩 Body recibido:", req.body);

    if (
      typeof cantidadWLD !== 'number' ||
      cantidadWLD <= 0 ||
      !tipo ||
      typeof montoQ !== 'number' ||
      montoQ <= 0
    ) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const usuarioID = session.sub as string;

    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('wallet_address')
      .eq('usuario_id', usuarioID)
      .single();

    if (userError || !usuario) {
      console.error("❌ Usuario no encontrado en Supabase:", userError);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const saldoReal = await getSaldoReal(usuario.wallet_address, console.log);
    console.log("💰 Saldo real:", saldoReal);

    if (saldoReal < cantidadWLD) {
      return res.status(400).json({ error: 'Saldo insuficiente (on-chain)', saldoReal });
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();

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
      console.error("❌ Error insertando transacción:", insertError);
      return res.status(500).json({ error: 'Error registrando transacción' });
    }

    console.log("✅ Transacción registrada con token:", token);

    return res.status(200).json({ ok: true, token, saldoReal });
  } catch (e: any) {
    console.error("❌ Error en transferir.ts:", e);
    return res.status(500).json({ error: 'Error en el servidor', details: e.message || e });
  }
}
