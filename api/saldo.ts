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
    // Buscar usuario en Supabase
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('usuario_id, saldo_wld, created_at')
      .eq('usuario_id', usuarioID)
      .single();

    if (error || !usuario) {
      console.error("❌ Error buscando usuario:", error);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Devolver saldo y datos extra
    return res.status(200).json({
      usuario_id: usuario.usuario_id,
      saldo: usuario.saldo_wld,
      creado: usuario.created_at
    });
  } catch (error) {
    console.error("🔥 Error en el servidor:", error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
