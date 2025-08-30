import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// auth por cookie
// @ts-ignore
const { verifySession } = require('./_lib/session');
function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || '';
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

// supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // ✅ exige sesión World ID
  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: 'unauthorized' });
  if (String(session.lvl).toLowerCase() !== 'orb') {
    return res.status(403).json({ error: 'verification_level_not_allowed' });
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

    // ⚠️ Ya NO validamos ni descontamos saldo en Supabase.
    // El saldo real ya fue debitado on-chain en cobrarWLD.

    // token único
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // registrar transacción en Supabase (solo historial, no saldo)
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
      created_at: new Date(),
    });
    if (insertError) return res.status(500).json({ error: 'Error registrando transacción' });

    return res.status(200).json({ ok: true, token });
  } catch (e) {
    console.error("transferir error:", e);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
