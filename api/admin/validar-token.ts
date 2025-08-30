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

    // 🔎 Buscar transacción
    const { data, error } = await supabase
      .from("transacciones")
      .select("id, estado, monto_q, usuario_id, created_at")
      .eq("token", token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Token no encontrado" });
    }

    return res.status(200).json({ ok: true, ...data });
  } catch (e: any) {
    return res.status(500).json({ error: "Error en el servidor", details: e.message });
  }
}
