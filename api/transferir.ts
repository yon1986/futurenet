import { VercelRequest, VercelResponse } from '@vercel/node';

console.log("🚀 transferir.ts cargado en Vercel");

let verifySession: any;
try {
  // intentamos importar verifySession
  // @ts-ignore
  verifySession = require('./_lib/session').verifySession;
  console.log("✅ verifySession importado correctamente");
} catch (err) {
  console.error("❌ Error importando verifySession:", err);
}

let getSaldoReal: any;
try {
  // intentamos importar getSaldoReal
  getSaldoReal = require('../utils/blockchain').getSaldoReal;
  console.log("✅ getSaldoReal importado correctamente");
} catch (err) {
  console.error("❌ Error importando getSaldoReal:", err);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("👉 Entró al handler de /api/transferir");

  try {
    return res.status(200).json({
      ok: true,
      verifySessionLoaded: !!verifySession,
      getSaldoRealLoaded: !!getSaldoReal,
      message: "Handler ejecutado con logs paso a paso",
    });
  } catch (e: any) {
    console.error("❌ Error en handler transferir:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
