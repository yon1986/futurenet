import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("🚀 Entró a /api/transferir");

  try {
    // Solo devolver respuesta de debug
    return res.status(200).json({ ok: true, message: "Handler activo en Vercel" });
  } catch (e: any) {
    console.error("❌ Error en transferir:", e);
    return res.status(500).json({ error: 'Error en el servidor', details: e.message });
  }
}
