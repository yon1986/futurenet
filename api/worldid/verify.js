// api/worldid/verify.js
const { signSession } = require('../_lib/session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  const APP_ID = process.env.WORLD_APP_ID;
  if (!APP_ID) {
    res.status(500).json({ ok: false, error: 'missing-app-id' });
    return;
  }

  try {
    const { proof, merkle_root, nullifier_hash, verification_level, action, signal_hash } =
      (req.body || {});

    if (!proof || !merkle_root || !nullifier_hash || !verification_level || !action) {
      res.status(400).json({ ok: false, error: 'missing-fields' });
      return;
    }

    const r = await fetch(`https://developer.worldcoin.org/api/v2/verify/${APP_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Futurenet/1.0' },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        verification_level,
        action,
        signal_hash,
      }),
    });

    const data = await r.json();

    if (!r.ok || !data?.success) {
      res.status(400).json({ ok: false, error: 'invalid-proof', details: data });
      return;
    }

    // ✅ Firmar cookie de sesión (30 días)
    const token = signSession({
      sub: nullifier_hash,
      lvl: verification_level,
      act: action,
      iat: Math.floor(Date.now() / 1000),
    });

    res.setHeader(
      'Set-Cookie',
      `fn_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    );

    res.status(200).json({ ok: true, nullifier_hash, action });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server-error' });
  }
};
