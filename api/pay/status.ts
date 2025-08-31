// api/pay/status.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
const { verifySession } = require("../_lib/session");

function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || "";
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: "unauthorized" });

  try {
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: "Falta referencia" });
    }

    // 🔎 Leer el pago en Supabase
    const { data: pay, error } = await supabase
      .from("payments")
      .select("status, tx_hash")
      .eq("reference", reference)
      .single();

    if (error || !pay) {
      return res.status(404).json({ error: "reference_not_found" });
    }

    // Devolver estado real
    return res.status(200).json({
      ok: true,
      status: pay.status,  // "pending" | "processing" | "confirmed" | "failed"
      reference,
      tx_hash: pay.tx_hash || null,
    });
  } catch (err: any) {
    console.error("🔥 Error en /pay/status:", err);
    return res.status(500).json({ error: "server_error", details: err.message });
  }
}
