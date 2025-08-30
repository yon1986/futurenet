import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("⚡ [transferir] endpoint llamado");

  try {
    if (req.method !== "POST") {
      console.log("❌ Método no permitido");
      return res.status(405).json({ ok: false, error: "Método no permitido" });
    }

    // Intentamos parsear body
    let body: any = {};
    try {
      body = req.body || {};
    } catch (err: any) {
      console.error("❌ Error parseando body:", err.message);
      return res.status(400).json({ ok: false, error: "Body inválido" });
    }

    console.log("📦 Body recibido:", body);

    // Simulación de validación
    if (!body.cantidadWLD) {
      console.log("❌ Falta cantidadWLD");
      return res.status(400).json({ ok: false, error: "Falta cantidadWLD" });
    }

    // Generamos token ficticio
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("✅ Respuesta lista:", { ok: true, token, saldoReal: 99 });

    // 🔥 Devolvemos JSON sí o sí
    return res.status(200).json({ ok: true, token, saldoReal: 99 });
  } catch (e: any) {
    console.error("🔥 Error inesperado en transferir:", e);
    return res.status(500).json({ ok: false, error: "Error en el servidor", details: e.message });
  }
}
