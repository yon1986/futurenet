// api/pay/initiate.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
const { verifySession } = require("../_lib/session");

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || "";
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: "unauthorized" });
  if (String(session.lvl).toLowerCase() !== "orb") {
    return res.status(403).json({ error: "verification_level_not_allowed" });
  }

  try {
    const { amountWLD } = (req.body || {}) as { amountWLD?: number };
    if (!amountWLD || amountWLD <= 0) return res.status(400).json({ error: "invalid_amount" });

    const usuarioID = session.sub as string;

    // referencia única
    const reference = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const to = (process.env.MERCHANT_WALLET || "").trim();
    if (!to) return res.status(500).json({ error: "missing_merchant_wallet" });

    const network = process.env.PAY_NETWORK || "worldchain";

    // guardar en Supabase
    const { error: insErr } = await supabase.from("payments").insert({
      usuario_id: usuarioID,
      reference,
      amount_wld: amountWLD,
      status: "pending",
      to,
      network,
      created_at: new Date(),
    });
    if (insErr) return res.status(500).json({ error: "db_insert_error" });

    return res.status(200).json({ ok: true, reference, to, network });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
