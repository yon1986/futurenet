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
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Falta referencia" });
    }

    // 1. Buscar pago en Supabase
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({ error: "Pago no encontrado en Supabase" });
    }

    // 2. Consultar Developer Portal
    const resp = await fetch(
      `https://developer.worldcoin.org/api/v1/payments/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({ error: "Error consultando Portal", details: txt });
    }

    const portalData = await resp.json();

    // Ejemplo esperado de portalData:
    // { reference: "pay_...", status: "mined", transactionHash: "0x..." }

    const portalStatus = portalData.status || "unknown";
    const txHash = portalData.transactionHash || null;

    // 3. Si el pago está minado, actualizar Supabase
    if (portalStatus === "mined") {
      await supabase
        .from("payments")
        .update({
          status: "confirmed",
          tx_hash: txHash,
          tx_id: txHash, // sobreescribimos con el correcto
        })
        .eq("reference", reference);

      return res.status(200).json({
        ok: true,
        status: "confirmed",
        tx_hash: txHash,
      });
    }

    // 4. Si sigue en submitted o processing
    return res.status(200).json({
      ok: true,
      status: portalStatus,
      tx_hash: txHash,
    });
  } catch (err: any) {
    console.error("🔥 Error en /pay/status:", err);
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: err.message });
  }
}
