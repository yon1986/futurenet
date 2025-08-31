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
  console.log("🌐 Consultando portal:", url);

  const resp = await fetch(url, { 
    method: "GET", 
    headers: { Authorization: `Bearer ${apiKey}` } 
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error("❌ Error portal:", resp.status, text);
    throw new Error(`portal_http_${resp.status}:${text}`);
  }

  const data = await resp.json();
  console.log("✅ Respuesta portal:", JSON.stringify(data, null, 2));
  return data;
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
  if (String(session.lvl).toLowerCase() !== "orb") {
    return res.status(403).json({ error: "verification_level_not_allowed" });
  }

  const usuarioID = session.sub as string;

  try {
    const { payload } = (req.body || {}) as { payload?: any };
    console.log("📩 Payload recibido:", JSON.stringify(payload, null, 2));

    const reference: string | undefined = payload?.reference;
    if (!reference) return res.status(400).json({ error: "missing_reference" });

    // Buscar el pago en Supabase
    const { data: pay, error: qErr } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();
    if (qErr || !pay) {
      console.error("❌ Pago no encontrado en DB:", qErr);
      return res.status(404).json({ error: "reference_not_found" });
    }
    if (pay.usuario_id !== usuarioID) {
      console.error("⚠️ Usuario no coincide:", usuarioID, pay.usuario_id);
      return res.status(403).json({ error: "forbidden" });
    }

    console.log("ℹ️ Estado actual en DB:", pay.status);

    if (pay.status === "confirmed") {
      return res.status(200).json({ ok: true, status: "confirmed", reference });
    }
    if (pay.status === "failed") return res.status(400).json({ error: "onchain_failed" });

    // Guarda payload para depuración
    await supabase.from("payments").update({ raw_payload: payload }).eq("id", pay.id);

    // Extraer txId
    const txId = findTxIdDeep(payload);
    console.log("🔎 txId extraído:", txId);

    if (txId && pay.tx_id !== txId) {
      await supabase.from("payments").update({ tx_id: txId }).eq("id", pay.id);
    }

    // Marcar como processing
    if (pay.status !== "processing") {
      await supabase.from("payments").update({ status: "processing" }).eq("id", pay.id);
    }

    // Verificar en portal de World App
    const appId = process.env.APP_ID;
    const apiKey = process.env.DEV_PORTAL_API_KEY;
    console.log("🔑 APP_ID presente?", !!appId, "API_KEY presente?", !!apiKey);

    if (!appId || !apiKey || !txId) {
      console.warn("⚠️ Falta appId, apiKey o txId");
      return res.status(200).json({ ok: true, status: "processing", reference });
    }

    const tx = await fetchTxOnce(txId, appId, apiKey);
    const txStatus = (tx?.status || tx?.transaction_status || "").toLowerCase();
    console.log("📊 Estado devuelto por portal:", txStatus);

    if (txStatus === "failed") {
      await supabase
        .from("payments")
        .update({ status: "failed", tx_hash: tx?.transaction_hash ?? null })
        .eq("id", pay.id);
      return res.status(400).json({ error: "onchain_failed" });
    }
    if (txStatus !== "mined" && txStatus !== "confirmed") {
      return res.status(200).json({ ok: true, status: "processing", reference });
    }

    // Confirmar transacción en Supabase
    await supabase
      .from("payments")
      .update({
        status: "confirmed",
        tx_hash: tx?.transaction_hash ?? null,
      })
      .eq("id", pay.id);

    console.log("✅ Transacción confirmada en DB con hash:", tx?.transaction_hash);

    return res.status(200).json({ ok: true, status: "confirmed", reference, tx });
  } catch (e: any) {
    console.error("🔥 Error en /pay/confirm:", e);
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
