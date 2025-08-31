import { VercelRequest, VercelResponse } from "@vercel/node";
// @ts-ignore
const { signSession } = require("./_lib/session");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { payload } = req.body || {};
    if (!payload || !payload.nullifier_hash) {
      return res.status(400).json({ error: "Payload inválido" });
    }

    // 👤 Guardamos lo más importante del usuario
    const sessionData = {
      sub: payload.nullifier_hash,
      lvl: payload.verification_level || "orb",
      iat: Math.floor(Date.now() / 1000),
    };

    // 🔑 Firmamos la sesión (usa _lib/session.js)
    const token = signSession(sessionData);

    // 🍪 Guardamos cookie (30 días de duración)
    res.setHeader("Set-Cookie", `fn_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`);

    return res.status(200).json({ ok: true, usuarioID: payload.nullifier_hash });
  } catch (err: any) {
    console.error("❌ Error en /api/session:", err);
    return res.status(500).json({ error: "server_error", detail: String(err.message || err) });
  }
}
