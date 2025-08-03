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
    const { 
      usuarioID, 
      cantidadWLD, 
      tipo, 
      montoQ, 
      nombre, 
      banco, 
      cuenta, 
      tipoCuenta,
      telefono
    } = req.body;

    // Validar datos principales
    if (!usuarioID || !cantidadWLD || !tipo || !montoQ) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Verificar usuario en Supabase
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario_id', usuarioID)
      .single();

    if (userError || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar saldo
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
      console.error("❌ Error al actualizar saldo:", updateError);
      return res.status(500).json({ error: 'Error actualizando el saldo' });
    }

    // Generar token único
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Insertar transacción con todos los datos
    const { error: insertError } = await supabase.from('transacciones').insert({
      usuario_id: usuarioID,
      tipo, // puede ser "bancaria" o "cajero"
      wld_cambiados: cantidadWLD,
      monto_q: montoQ,
      token,
      nombre: tipo === "bancaria" ? nombre || null : null,
      banco: tipo === "bancaria" ? banco || null : null,
      cuenta: tipo === "bancaria" ? cuenta || null : null,
      tipo_cuenta: tipo === "bancaria" ? tipoCuenta || null : null,
      telefono: tipo === "cajero" ? telefono || null : null,
      created_at: new Date()
    });

    if (insertError) {
      console.error("❌ Error al registrar transacción:", insertError);
      return res.status(500).json({ error: 'Error registrando transacción' });
    }

    return res.status(200).json({ ok: true, token, nuevoSaldo });
  } catch (error) {
    console.error("🔥 Error inesperado:", error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
