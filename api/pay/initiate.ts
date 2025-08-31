// api/pay/initiate.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
const { verifySession } = require("../_lib/session");

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || "";
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: "unauthorized" });

  try {
    const { amountWLD } = (req.body || {}) as { amountWLD?: number };
    if (!amountWLD || amountWLD <= 0) return res.status(400).json({ error: "invalid_amount" });

    const usuarioID = session.sub as string;

    // ✅ Asegurar que el usuario exista en la tabla `usuarios`
    let { data: usuario, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("usuario_id", usuarioID)
      .single();

    if (userError || !usuario) {
      const { error: insertUserError } = await supabase
        .from("usuarios")
        .insert({ usuario_id: usuarioID, saldo_wld: 0 });

      if (insertUserError) {
        console.error("❌ Error creando usuario:", insertUserError);
        return res.status(500).json({ error: "db_user_insert_error", detail: insertUserError });
      }
    }

    // 🔑 Generar referencia única
    const reference = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 🔥 Insert en payments (usuario_id ya garantizado)
    const { error: insErr } = await supabase.from("payments").insert({
      usuario_id: usuarioID,
      reference,
      amount_wld: amountWLD,
      status: "pending"
    });
    if (insErr) {
      console.error("❌ Error insertando en payments:", insErr);
      return res.status(500).json({ error: "db_insert_error", detail: insErr });
    }

    const to = (process.env.MERCHANT_WALLET || "").trim();
    if (!to) return res.status(500).json({ error: "missing_merchant_wallet" });

    const appId = process.env.WORLD_APP_ID;
    if (!appId) return res.status(500).json({ error: "missing_app_id" });

    return res.status(200).json({
      ok: true,
      reference,
      to,
      network: "worldchain",
      appId
    });
  } catch (e: any) {
    console.error("🔥 Error en /api/pay/initiate:", e);
    return res.status(500).json({ error: "server_error", detail: String(e?.message || e) });
  }
}
