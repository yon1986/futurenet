// api/pay/confirm.ts
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
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: "unauthorized" });
  if (String(session.lvl).toLowerCase() !== "orb") {
    return res.status(403).json({ error: "verification_level_not_allowed" });
  }

  const usuarioID = session.sub as string;

  try {
    const { payload } = (req.body || {}) as { payload?: any };
    const reference: string | undefined = payload?.reference;
    if (!reference) return res.status(400).json({ error: "missing_reference" });

    // Buscar el pago en Supabase
    const { data: pay, error: qErr } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (qErr || !pay) return res.status(404).json({ error: "reference_not_found" });
    if (pay.usuario_id !== usuarioID) return res.status(403).json({ error: "forbidden" });

    // Guardar payload y marcar confirmado directamente
    const txId = payload?.transaction_id || payload?.tx_id || null;

    await supabase
      .from("payments")
      .update({
        status: "confirmed",
        raw_payload: payload,
        tx_id: txId,
        tx_hash: txId, // opcional: lo usamos igual que hash para no dejar null
      })
      .eq("id", pay.id);

    return res.status(200).json({
      ok: true,
      status: "confirmed",
      reference,
      tx_id: txId,
    });
  } catch (e: any) {
    console.error("🔥 Error en /pay/confirm:", e);
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
