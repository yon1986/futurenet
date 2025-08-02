import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { usuarioID, cantidadWLD, tipo, montoQ } = req.body;

  if (!usuarioID || !cantidadWLD) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  // Verificar saldo
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("usuario_id", usuarioID)
    .single();

  if (error || !usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  if (usuario.saldo_wld < cantidadWLD) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  // Actualizar saldo
  await supabase
    .from("usuarios")
    .update({ saldo_wld: usuario.saldo_wld - cantidadWLD })
    .eq("usuario_id", usuarioID);

  // Guardar transacción
  const token = Math.floor(100000 + Math.random() * 900000).toString();

  await supabase.from("transacciones").insert({
    usuario_id: usuarioID,
    tipo,
    wld_cambiados: cantidadWLD,
    monto_q: montoQ,
    token,
    estado: "pendiente",
  });

  return res.status(200).json({ ok: true, token });
}