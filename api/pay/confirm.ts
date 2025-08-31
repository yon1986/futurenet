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

async function fetchTxOnce(txId: string, appId: string, apiKey: string) {
  const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${txId}?app_id=${appId}&type=payment`;
  const resp = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`portal_http_${resp.status}:${text}`);
  }
  return resp.json();
}

function findTxIdDeep(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj)) {
    const key = k.toLowerCase();
    if (typeof v === "string") {
      if (["transaction_id", "tx_id", "transactionid", "txid"].includes(key)) {
        return v;
      }
    }
    if (v && typeof v === "object") {
      const r = findTxIdDeep(v);
      if (r) return r;
    }
  }
  return;
}

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
    const { data: pay } = await supabase.from("payments").select("*").eq("reference", reference).single();
    if (!pay) return res.status(404).json({ error: "reference_not_found" });
    if (pay.usuario_id !== usuarioID) return res.status(403).json({ error: "forbidden" });

    if (pay.status === "confirmed") {
      return res.status(200).json({ ok: true, status: "confirmed", reference, tx_hash: pay.tx_hash });
    }
    if (pay.status === "failed") return res.status(400).json({ error: "onchain_failed" });

    // Guarda payload
    await supabase.from("payments").update({ raw_payload: payload }).eq("id", pay.id);

    // Extraer txId
    let txId = findTxIdDeep(payload);
    if (!txId && payload?.finalPayload?.tx_id) {
      txId = payload.finalPayload.tx_id;
    }
    if (txId && pay.tx_id !== txId) {
      await supabase.from("payments").update({ tx_id: txId }).eq("id", pay.id);
    }

    // Marcar como processing
    if (pay.status !== "processing") {
      await supabase.from("payments").update({ status: "processing" }).eq("id", pay.id);
    }

    const appId = process.env.APP_ID;
    const apiKey = process.env.DEV_PORTAL_API_KEY;
    if (!appId || !apiKey || !txId) {
      return res.status(200).json({ ok: true, status: "processing", reference });
    }

    // Verificar transacción en World App
    const tx = await fetchTxOnce(txId, appId, apiKey);
    const txStatus = (tx?.status || tx?.transaction_status || "").toLowerCase();

    if (txStatus === "failed") {
      await supabase.from("payments").update({ status: "failed", tx_hash: tx?.transaction_hash ?? null }).eq("id", pay.id);
      return res.status(400).json({ error: "onchain_failed" });
    }

    if (["mined", "confirmed", "success"].includes(txStatus)) {
      await supabase.from("payments").update({
        status: "confirmed",
        tx_hash: tx?.transaction_hash ?? null,
      }).eq("id", pay.id);

      return res.status(200).json({ ok: true, status: "confirmed", reference, tx_hash: tx?.transaction_hash });
    }

    // Si aún no está confirmado → seguimos en processing
    return res.status(200).json({ ok: true, status: "processing", reference });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
