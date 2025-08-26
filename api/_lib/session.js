// api/_lib/session.js
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'change-me';

const b64url = (input) =>
  Buffer.isBuffer(input)
    ? input.toString('base64url')
    : Buffer.from(input, 'utf8').toString('base64url');

function signSession(payload, maxAgeSec = 60 * 60 * 24 * 30) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const data = b64url(JSON.stringify(body));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(data).digest());
  return `${data}.${sig}`;
}

function verifySession(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', SECRET).update(data).digest());
  if (sig !== expected) return null;
  const json = Buffer.from(data, 'base64url').toString('utf8');
  const body = JSON.parse(json);
  if (body.exp && Math.floor(Date.now() / 1000) > body.exp) return null;
  return body;
}

module.exports = { signSession, verifySession };
