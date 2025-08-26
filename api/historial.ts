// api/historial.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/* auth por cookie */
// @ts-ignore
const { verifySession } = require('./_lib/session');
function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || '';
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

/* supabase */
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // ✅ exige sesión
  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: 'unauthorized' });
  const usuarioID = session.sub as string;

  try {
    const { data, error } = await supabase
      .from('transacciones')
      .select(`
        id,
        tipo,
        token,
        monto_q,
        wld_cambiados,
        created_at,
        nombre,
        banco,
        cuenta,
        tipo_cuenta,
        telefono
      `)
      .eq('usuario_id', usuarioID)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Error consultando historial' });

    return res.status(200).json({ transacciones: data });
  } catch (e) {
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
