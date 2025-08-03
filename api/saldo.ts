import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const usuarioID = req.query.usuarioID as string;
    if (!usuarioID) {
      return res.status(400).json({ error: 'usuarioID requerido' });
    }

    // Buscar usuario
    let { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario_id', usuarioID)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Otro error que no es "no encontrado"
      throw error;
    }

    // Si no existe, crear usuario
    if (!usuario) {
      const { data, error: insertError } = await supabase
        .from('usuarios')
        .insert({ usuario_id: usuarioID })
        .select()
        .single();

      if (insertError) throw insertError;
      usuario = data;
    }

    return res.status(200).json({ saldoWLD: usuario?.saldo_wld || 0 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el saldo' });
  }
}
