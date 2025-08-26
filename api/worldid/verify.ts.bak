// api/worldid/verify.ts

// Fuerza runtime Node 18 (tiene fetch nativo y evita crashes por entorno)
export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req: any, res: any) {
  // GET → confirmación de que la ruta existe
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method-not-allowed" });
    return;
  }

  const APP_ID = process.env.WORLD_APP_ID; // ej: app_16e531ba60f3f22005fa73b1bd8fb93f
  if (!APP_ID) {
    res.status(500).json({ ok: false, error: "missing-app-id" });
    return;
  }

  try {
    const {
      proof,
      merkle_root,
      nullifier_hash,
      verification_level,
      action,
      signal_hash,
    } = (req.body ?? {}) as Record<string, unknown>;

    if (!proof || !merkle_root || !nullifier_hash || !verification_level || !action) {
      res.status(400).json({ ok: false, error: "missing-fields" });
      return;
    }

    const r = await fetch(`https://developer.worldcoin.org/api/v2/verify/${APP_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Futurenet/1.0",
      },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        verification_level,
        action,
        signal_hash,
        // max_age: 3600, // opcional
      }),
    });

    const data = await r.json();

    if (!r.ok || !data?.success) {
      res.status(400).json({ ok: false, error: "invalid-proof", details: data });
      return;
    }

    res.status(200).json({ ok: true, nullifier_hash, action });
  } catch (e) {
    res.status(500).json({ ok: false, error: "server-error" });
  }
}
