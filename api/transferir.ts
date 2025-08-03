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
    console.log("📩 Datos recibidos:", { usuarioID, cantidadWLD, tipo, montoQ });

    if (!usuarioID || !cantidadWLD || !tipo) {
      console.log("❌ Faltan datos");
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Verificar saldo del usuario
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario_id', usuarioID)
      .single();

    console.log("🔎 Resultado de la consulta usuario:", { usuario, userError });

    if (userError || !usuario) {
      console.log("❌ Usuario no encontrado en Supabase");
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.saldo_wld < cantidadWLD) {
      console.log("❌ Saldo insuficiente");
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Actualizar saldo
    const nuevoSaldo = usuario.saldo_wld - cantidadWLD;
    console.log("💰 Nuevo saldo:", nuevoSaldo);

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ saldo_wld: nuevoSaldo })
      .eq('usuario_id', usuarioID);

    if (updateError) {
      console.error("❌ Error al actualizar saldo:", updateError);
      return res.status(500).json({ error: 'Error al actualizar el saldo' });
    }

    // Guardar transacción
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("📝 Token generado:", token);

    const { error: insertError } = await supabase.from('transacciones').insert({
      usuario_id: usuarioID,
      tipo,
      wld_cambiados: cantidadWLD,
      monto_q: montoQ || 0,
      token,
      estado: 'pendiente',
    });

    if (insertError) {
      console.error("❌ Error al registrar la transacción:", insertError);
      return res.status(500).json({ error: 'Error al registrar la transacción' });
    }

    console.log("✅ Transacción registrada correctamente");

    return res.status(200).json({ ok: true, token, nuevoSaldo });
  } catch (error) {
    console.error("🔥 Error inesperado en el servidor:", error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
