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

  // ✅ exige sesión (pero no usamos usuarioID para filtrar en depuración)
  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  try {
    const { data, error } = await supabase
      .from('transacciones')
      .select(`
        id,
        usuario_id,
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error consultando historial:", error);
      return res.status(500).json({ error: 'Error consultando historial' });
    }

    console.log("➡️ Historial recuperado:", data);

    return res.status(200).json({ transacciones: data });
  } catch (e) {
    console.error("❌ Error en /historial:", e);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
