import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// @ts-ignore
const { verifySession } = require("./_lib/session");

function getSessionFromCookie(req: VercelRequest) {
  const cookie = req.headers?.cookie || "";
  const m = cookie.match(/(?:^|;\s*)fn_session=([^;]+)/);
  const token = m && m[1];
  return verifySession(token);
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("⚡ [transferir] endpoint alcanzado");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  const session = getSessionFromCookie(req);
  if (!session) {
    console.log("❌ Sesión inválida");
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    const {
      cantidadWLD,
      tipo,
      montoQ,
      nombre,
      banco,
      cuenta,
      tipoCuenta,
      telefono,
    } = req.body || {};

    console.log("📦 Body recibido:", req.body);

    if (
      typeof cantidadWLD !== "number" ||
      cantidadWLD <= 0 ||
      !tipo ||
      typeof montoQ !== "number" ||
      montoQ <= 0
    ) {
      return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    const usuarioID = session.sub as string;

    // 🔑 token único
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // 💾 Registrar transacción en Supabase
    const { error: insertError } = await supabase.from("transacciones").insert({
      usuario_id: usuarioID,
      tipo,
      wld_cambiados: cantidadWLD,
      monto_q: montoQ,
      token,
      nombre: tipo === "bancaria" ? nombre || null : null,
      banco: tipo === "bancaria" ? banco || null : null,
      cuenta: tipo === "bancaria" ? cuenta || null : null,
      tipo_cuenta: tipo === "bancaria" ? tipoCuenta || null : null,
      telefono: tipo === "cajero" ? telefono || null : null,
      estado: "pendiente",
      created_at: new Date(),
    });

    if (insertError) {
      console.error("❌ Error insertando en Supabase:", insertError.message);
      return res
        .status(500)
        .json({ ok: false, error: "Error registrando transacción" });
    }

    console.log("✅ Transacción registrada:", { token });

    return res.status(200).json({ ok: true, token });
  } catch (e: any) {
    console.error("🔥 Error inesperado en transferir:", e);
    return res
      .status(500)
      .json({ ok: false, error: "Error en el servidor", details: e.message });
  }
}
