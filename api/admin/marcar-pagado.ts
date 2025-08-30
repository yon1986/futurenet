import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Falta token" });
    }

    // 🔄 Actualizar a pagado
    const { data, error } = await supabase
      .from("transacciones")
      .update({ estado: "pagado" })
      .eq("token", token)
      .select("id, estado");

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "Token no encontrado" });
    }

    return res.status(200).json({ ok: true, token, nuevoEstado: "pagado" });
  } catch (e: any) {
    return res.status(500).json({ error: "Error en el servidor", details: e.message });
  }
}
