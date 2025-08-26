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

// Busca transaction_id/tx_id en cualquier nivel del objeto
function findTxIdDeep(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj)) {
    const key = k.toLowerCase();
    if (typeof v === "string") {
      if (key === "transaction_id" || key === "tx_id" || key === "transactionid" || key === "txid") {
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

  const usuarioID = session.sub as string;

  try {
    const { payload } = (req.body || {}) as { payload?: any };
    const reference: string | undefined = payload?.reference;
    if (!reference) return res.status(400).json({ error: "missing_reference" });

    const { data: pay, error: qErr } = await supabase.from("payments").select("*").eq("reference", reference).single();
    if (qErr || !pay) return res.status(404).json({ error: "reference_not_found" });
    if (pay.usuario_id !== usuarioID) return res.status(403).json({ error: "forbidden" });

    if (pay.status === "confirmed") {
      const { data: user } = await supabase.from("usuarios").select("*").eq("usuario_id", usuarioID).single();
      return res.status(200).json({ ok: true, status: "confirmed", reference, credited: pay.amount_wld, saldo: user?.saldo_wld });
    }
    if (pay.status === "failed") return res.status(400).json({ error: "onchain_failed" });

    // Guarda SIEMPRE el payload en la fila para debug
    await supabase.from("payments").update({ raw_payload: payload }).eq("id", pay.id);

    // Extrae txId en cualquier formato y guárdalo
    const txId = findTxIdDeep(payload);
    if (txId && pay.tx_id !== txId) {
      await supabase.from("payments").update({ tx_id: txId }).eq("id", pay.id);
    }

    // Pasa a processing ya mismo
    if (pay.status !== "processing") {
      await supabase.from("payments").update({ status: "processing" }).eq("id", pay.id);
    }

    // Si no hay credenciales o no hay txId aún → deja que el front haga polling
    const appId = process.env.APP_ID;
    const apiKey = process.env.DEV_PORTAL_API_KEY;
    if (!appId || !apiKey || !txId) {
      return res.status(200).json({ ok: true, status: "processing", reference });
    }

    const tx = await fetchTxOnce(txId, appId, apiKey);
    const txStatus = (tx?.status || tx?.transaction_status || "").toLowerCase();

    if (txStatus === "failed") {
      await supabase.from("payments").update({ status: "failed", tx_hash: tx?.transaction_hash ?? null }).eq("id", pay.id);
      return res.status(400).json({ error: "onchain_failed" });
    }
    if (txStatus !== "mined" && txStatus !== "confirmed") {
      return res.status(200).json({ ok: true, status: "processing", reference });
    }

    // Validaciones finales
    if (tx.reference !== reference) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return res.status(400).json({ error: "reference_mismatch" });
    }
    const merchant = (process.env.MERCHANT_WALLET || "").toLowerCase();
    if (merchant && tx?.to && String(tx.to).toLowerCase() !== merchant) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", pay.id);
      return res.status(400).json({ error: "recipient_mismatch" });
    }

    // Confirmar y acreditar
    await supabase.from("payments").update({ status: "confirmed", tx_hash: tx?.transaction_hash ?? null }).eq("id", pay.id);

    const { data: user } = await supabase.from("usuarios").select("*").eq("usuario_id", usuarioID).single();
    const acreditado = Number(pay.amount_wld || 0);
    if (!user) {
      await supabase.from("usuarios").insert({ usuario_id: usuarioID, saldo_wld: acreditado });
      return res.status(200).json({ ok: true, status: "confirmed", reference, credited: acreditado, saldo: acreditado, tx });
    } else {
      const nuevoSaldo = Number(user.saldo_wld || 0) + acreditado;
      await supabase.from("usuarios").update({ saldo_wld: nuevoSaldo }).eq("usuario_id", usuarioID);
      return res.status(200).json({ ok: true, status: "confirmed", reference, credited: acreditado, saldo: nuevoSaldo, tx });
    }
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
