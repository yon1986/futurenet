import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSaldoReal } from '../utils/blockchain'; // 👈 tu función on-chain

// @ts-ignore
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
  console.log("📥 Transferir endpoint hit");

  if (req.method !== 'POST') {
    console.log("❌ Método no permitido");
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const session = getSessionFromCookie(req);
  if (!session) {
    console.log("❌ Sesión inválida");
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (String(session.lvl).toLowerCase() !== 'orb') {
    console.log("❌ Nivel de verificación no permitido");
    return res.status(403).json({ ok: false, error: 'verification_level_not_allowed' });
  }

  try {
    const {
      cantidadWLD,
      tipo,        // 'bancaria' | 'cajero'
      montoQ,
      nombre,
      banco,
      cuenta,
      tipoCuenta,
      telefono,
    } = req.body || {};

    console.log("📦 Body recibido:", req.body);

    if (
      typeof cantidadWLD !== 'number' ||
      cantidadWLD <= 0 ||
      !tipo ||
      typeof montoQ !== 'number' ||
      montoQ <= 0
    ) {
      console.log("❌ Datos incompletos");
      return res.status(400).json({ ok: false, error: 'Datos incompletos' });
    }

    const usuarioID = session.sub as string;

    // 📌 Obtener usuario (para leer walletAddress al menos)
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('wallet_address')
      .eq('usuario_id', usuarioID)
      .single();

    if (userError || !usuario) {
      console.log("❌ Usuario no encontrado");
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    console.log("👛 Wallet encontrada:", usuario.wallet_address);

    // ✅ Verificar saldo real desde blockchain
    const saldoReal = await getSaldoReal(usuario.wallet_address, (msg: string) => console.log("🔎", msg));
    console.log("💰 Saldo real:", saldoReal);

    if (saldoReal < cantidadWLD) {
      console.log("❌ Saldo insuficiente");
      return res.status(400).json({ ok: false, error: 'Saldo insuficiente (on-chain)' });
    }

    // token único
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // registrar transacción (👈 estado siempre pendiente)
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
      console.log("❌ Error registrando transacción:", insertError.message);
      return res.status(500).json({ ok: false, error: 'Error registrando transacción', details: insertError.message });
    }

    console.log("✅ Transacción registrada:", { token, saldoReal });

    // 🚀 devolvemos éxito y el saldo real
    return res.status(200).json({ ok: true, token, saldoReal });
  } catch (e: any) {
    console.error("🔥 Error inesperado en transferir:", e);
    return res.status(500).json({ ok: false, error: 'Error en el servidor', details: e.message });
  }
}
