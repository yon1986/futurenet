// api/saldo.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Auth por cookie (helper en api/_lib/session.js) ---
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-ignore
const { verifySession } = require('./_lib/session');

function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || '';
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

// --- Supabase ---
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // ✅ Requiere sesión válida (World ID verificado)
  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const usuarioID = session.sub as string;

  try {
    // Buscar usuario en Supabase
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('saldo_wld')
      .eq('usuario_id', usuarioID)
      .single();

    if (error || !usuario) {
      // Si no existe, crearlo con saldo inicial (demo)
      await supabase.from('usuarios').insert({
        usuario_id: usuarioID,
        saldo_wld: 10,
      });
      return res.status(200).json({ saldo: 10 });
    }

    // Devolver saldo actual
    return res.status(200).json({ saldo: usuario.saldo_wld });
  } catch (e) {
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
