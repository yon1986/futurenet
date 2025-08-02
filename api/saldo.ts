import { createClient } from "@supabase/supabase-js";

// Conectamos con Supabase usando las variables de entorno
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: any, res: any) {
  // Obtenemos el usuarioID de la URL (ejemplo: ?usuarioID=usuario_prueba)
  const { usuarioID } = req.query;

  if (!usuarioID) return res.status(400).json({ error: "usuarioID requerido" });

  // Buscar el usuario en Supabase
  let { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("usuario_id", usuarioID)
    .single();

  // Si no existe, lo creamos con saldo inicial
  if (!usuario) {
    const { data } = await supabase
      .from("usuarios")
      .insert({ usuario_id: usuarioID })
      .select()
      .single();

    usuario = data;
  }

  // Devolvemos el saldo al frontend
  res.status(200).json({ saldoWLD: usuario?.saldo_wld || 0 });
}
