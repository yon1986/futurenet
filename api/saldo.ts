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

    if (error) {
      console.error("❌ Error consultando historial:", error);
      return res.status(500).json({ error: 'Error consultando historial' });
    }

    return res.status(200).json({ transacciones: data });
  } catch (error) {
    console.error("🔥 Error en el servidor:", error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
