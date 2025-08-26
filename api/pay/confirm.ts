import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
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
    const { payload } = (req.body || {}) as { payload?: any };
    if (!payload?.reference || !payload?.transaction_id) {
      return res.status(400).json({ error: "invalid_payload" });
    }

    const { data: pay, error: qErr } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", payload.reference)
      .single();

    if (qErr || !pay) return res.status(404).json({ error: "reference_not_found" });
    if (pay.usuario_id !== usuarioID) return res.status(403).json({ error: "forbidden" });
    if (pay.status !== "pending") return res.status(400).json({ error: "already_processed" });

    const appId = process.env.APP_ID;
    const apiKey = process.env.DEV_PORTAL_API_KEY;
    if (!appId || !apiKey) return res.status(500).json({ error: "missing_portal_creds" });

    const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${appId}`;
    const resp = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } });
    const tx = await resp.json();

    if (tx?.reference !== pay.reference || tx?.status !== "success") {
      await supabase
        .from("payments")
        .update({ status: "failed", tx_hash: tx?.hash || tx?.transaction_hash || null })
        .eq("id", pay.id);
      return res.status(400).json({ error: "verification_failed" });
    }

    const merchant = (process.env.MERCHANT_WALLET || "").toLowerCase();
    if (merchant && tx?.to_address && String(tx.to_address).toLowerCase() !== merchant) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return res.status(400).json({ error: "recipient_mismatch" });
    }

    await supabase
      .from("payments")
      .update({ status: "confirmed", tx_hash: tx?.hash || tx?.transaction_hash || null })
      .eq("id", pay.id);

    const { data: user } = await supabase
      .from("usuarios")
      .select("*")
      .eq("usuario_id", usuarioID)
      .single();

    if (!user) {
      await supabase
        .from("usuarios")
        .insert({ usuario_id: usuarioID, saldo_wld: Number(pay.amount_wld) });
      return res.status(200).json({ ok: true, credited: pay.amount_wld, saldo: pay.amount_wld, tx });
    } else {
      const nuevoSaldo = Number(user.saldo_wld || 0) + Number(pay.amount_wld);
      await supabase
        .from("usuarios")
        .update({ saldo_wld: nuevoSaldo })
        .eq("usuario_id", usuarioID);
      return res.status(200).json({ ok: true, credited: pay.amount_wld, saldo: nuevoSaldo, tx });
    }
  } catch {
    return res.status(500).json({ error: "server_error" });
  }
}
