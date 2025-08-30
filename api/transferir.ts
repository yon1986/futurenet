import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("🚀 Handler transferir ejecutado");

    // 🔎 Respuesta de prueba, siempre texto plano
    return res.status(200).send("OK desde /api/transferir");
  } catch (e: any) {
    console.error("❌ Error en transferir:", e);
    return res.status(500).send("ERROR en /api/transferir");
  }
}
