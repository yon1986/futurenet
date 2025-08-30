import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Falta referencia" });
    }

    // ✅ Como ya confirmamos el cobro on-chain en cobrarWLD,
    // aquí simplemente devolvemos "confirmed".
    return res.status(200).json({
      ok: true,
      status: "confirmed",
      reference,
    });
  } catch (err: any) {
    console.error("🔥 Error en /pay/status:", err);
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: err.message });
  }
}
