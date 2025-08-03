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

  try {
    const { usuarioID, cantidadWLD, tipo, montoQ } = req.body;

    if (!usuarioID || !cantidadWLD || !tipo) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Verificar saldo del usuario
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario_id', usuarioID)
      .single();

    if (userError || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.saldo_wld < cantidadWLD) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Actualizar saldo
    const nuevoSaldo = usuario.saldo_wld - cantidadWLD;
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ saldo_wld: nuevoSaldo })
      .eq('usuario_id', usuarioID);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: 'Error al actualizar el saldo' });
    }

    // Guardar transacción
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: insertError } = await supabase.from('transacciones').insert({
      usuario_id: usuarioID,
      tipo,
      wld_cambiados: cantidadWLD,
      monto_q: montoQ || 0,
      token,
      estado: 'pendiente',
    });

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: 'Error al registrar la transacción' });
    }

    return res.status(200).json({ ok: true, token, nuevoSaldo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
