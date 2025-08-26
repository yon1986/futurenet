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

async function fetchTx(txId: string, appId: string, apiKey: string) {
  const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${txId}?app_id=${appId}&type=payment`;
  const resp = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`portal_http_${resp.status}:${text}`);
  }
  return resp.json();
}

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
    if (pay.status !== "pending" && pay.status !== "processing") {
      // ya procesado previamente
      if (pay.status === "confirmed") {
        const { data: user } = await supabase.from("usuarios").select("*").eq("usuario_id", usuarioID).single();
        return res.status(200).json({ ok: true, status: "confirmed", credited: pay.amount_wld, saldo: user?.saldo_wld });
      }
      if (pay.status === "failed") return res.status(400).json({ error: "onchain_failed" });
    }

    const appId = process.env.APP_ID;
    const apiKey = process.env.DEV_PORTAL_API_KEY;
    if (!appId || !apiKey) return res.status(500).json({ error: "missing_portal_creds" });

    // Poll hasta "mined"
    let tx: any = null;
    const start = Date.now();
    const timeoutMs = 120_000;  // 120s
    const intervalMs = 2_500;

    while (Date.now() - start < timeoutMs) {
      tx = await fetchTx(payload.transaction_id, appId, apiKey);

      if (tx?.transaction_status === "mined") break;
      if (tx?.transaction_status === "failed") {
        await supabase
          .from("payments")
          .update({ status: "failed", tx_hash: tx?.transaction_hash ?? null })
          .eq("id", pay.id);
        return res.status(400).json({ error: "onchain_failed" });
      }
      // pending → espera e intenta de nuevo
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    if (!tx || tx.transaction_status !== "mined") {
      // No minó a tiempo → queda "processing" y NO devolvemos error
      await supabase.from("payments").update({ status: "processing" }).eq("id", pay.id);
      return res.status(200).json({ ok: true, status: "processing" });
    }

    // Validaciones de integridad
    if (tx.reference !== pay.reference) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return res.status(400).json({ error: "reference_mismatch" });
    }
    const merchant = (process.env.MERCHANT_WALLET || "").toLowerCase();
    if (merchant && tx?.to && String(tx.to).toLowerCase() !== merchant) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return res.status(400).json({ error: "recipient_mismatch" });
    }

    // Confirmar y acreditar saldo
    await supabase
      .from("payments")
      .update({ status: "confirmed", tx_hash: tx?.transaction_hash ?? null })
      .eq("id", pay.id);

    const { data: user } = await supabase.from("usuarios").select("*").eq("usuario_id", usuarioID).single();
    const acreditado = Number(pay.amount_wld);

    if (!user) {
      await supabase.from("usuarios").insert({ usuario_id: usuarioID, saldo_wld: acreditado });
      return res.status(200).json({ ok: true, status: "confirmed", credited: acreditado, saldo: acreditado, tx });
    } else {
      const nuevoSaldo = Number(user.saldo_wld || 0) + acreditado;
      await supabase.from("usuarios").update({ saldo_wld: nuevoSaldo }).eq("usuario_id", usuarioID);
      return res.status(200).json({ ok: true, status: "confirmed", credited: acreditado, saldo: nuevoSaldo, tx });
    }
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
