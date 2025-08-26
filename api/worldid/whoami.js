// api/worldid/whoami.js
const { verifySession } = require('../_lib/session');

module.exports = async (req, res) => {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = match && match[1];
  const session = verifySession(token);

  if (!session) {
    res.status(200).json({ ok: false, authenticated: false });
    return;
  }
  res.status(200).json({ ok: true, authenticated: true, session });
};
