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
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('saldo_wld')
      .eq('usuario_id', usuarioID)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ saldo: usuario.saldo_wld });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
