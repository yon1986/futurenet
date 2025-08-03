import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { usuarioID } = req.body;

  if (!usuarioID) {
    return res.status(400).json({ error: 'Falta usuarioID' });
  }

  try {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('usuario_id', usuarioID)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Error consultando transacciones' });
    }

    return res.status(200).json({ transacciones: data });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
