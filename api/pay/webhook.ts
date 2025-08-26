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
    const body = req.body;

    // ✅ Validar que traiga lo necesario
    if (!body?.reference || !body?.transaction_id || !body?.transaction_status) {
      return res.status(400).json({ error: "Payload incompleto" });
    }

    // Guardar payload crudo para auditoría
    await supabase
      .from("payments")
      .update({
        raw_payload: JSON.stringify(body),
      })
      .eq("reference", body.reference);

    // Si ya está minada, actualizar estado en Supabase
    if (body.transaction_status === "mined") {
      await supabase
        .from("payments")
        .update({
          status: "confirmed",
          tx_hash: body.transaction_id,
          tx_id: body.transaction_id,
        })
        .eq("reference", body.reference);
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("🔥 Error en webhook:", err);
    return res.status(500).json({ error: "Error en el servidor", details: err.message });
  }
}
