import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
const { verifySession } = require("./_lib/session");

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const session = verifySession(req.headers.cookie?.match(/fn_session=([^;]+)/)?.[1]);
  if (!session) return res.status(401).json({ error: "unauthorized" });

  const { walletAddress } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ error: "Falta walletAddress" });
  }

  const usuarioID = session.sub as string;

  const { error } = await supabase
    .from("usuarios")
    .update({ wallet_address: walletAddress })
    .eq("usuario_id", usuarioID);

  if (error) return res.status(500).json({ error: "Error guardando wallet" });

  return res.status(200).json({ ok: true });
}
