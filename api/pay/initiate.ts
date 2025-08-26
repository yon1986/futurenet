import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
// @ts-ignore (helper JS)
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

  const usuarioID = session.sub as string;

  try {
    const { amountWLD } = (req.body || {}) as { amountWLD?: number };
    if (!amountWLD || typeof amountWLD !== "number" || amountWLD <= 0) {
      return res.status(400).json({ error: "amount_invalid" });
    }

    // asegurar usuario
    const { data: user } = await supabase
      .from("usuarios")
      .select("*")
      .eq("usuario_id", usuarioID)
      .single();
    if (!user) {
      await supabase.from("usuarios").insert({ usuario_id: usuarioID, saldo_wld: 0 });
    }

    const reference = crypto.randomUUID().replace(/-/g, "");
    const to = process.env.MERCHANT_WALLET;
    if (!to) return res.status(500).json({ error: "missing_merchant_wallet" });

    const { error: insErr } = await supabase.from("payments").insert({
      reference,
      usuario_id: usuarioID,
      amount_wld: amountWLD,
      status: "pending",
      created_at: new Date(),
    });
    if (insErr) return res.status(500).json({ error: "db_insert_error" });

    return res.status(200).json({
      ok: true,
      reference,
      to,
      network: process.env.PAY_NETWORK || "worldchain",
    });
  } catch {
    return res.status(500).json({ error: "server_error" });
  }
}
