// api/transferir.ts
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // ✅ exige sesión World ID
  const session = getSessionFromCookie(req);
  if (!session) return res.status(401).json({ error: "unauthorized" });
  if (String(session.lvl).toLowerCase() !== "orb") {
    return res
      .status(403)
      .json({ error: "verification_level_not_allowed" });
  }

  try {
    const {
      cantidadWLD,
      tipo, // 'bancaria' | 'cajero'
      montoQ,
      nombre,
      banco,
      cuenta,
      tipoCuenta,
      telefono,
    } = req.body || {};

    if (
      typeof cantidadWLD !== "number" ||
      cantidadWLD <= 0 ||
      !tipo ||
      typeof montoQ !== "number" ||
      montoQ <= 0
    ) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const usuarioID = session.sub as string;

    // 🔎 Buscar usuario
    let { data: usuario, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("usuario_id", usuarioID)
      .single();

    // ✅ Si no existe, lo creamos automáticamente
    if (userError || !usuario) {
      const { error: insertUserError } = await supabase
        .from("usuarios")
        .insert({ usuario_id: usuarioID, saldo_wld: 0 });

      if (insertUserError) {
        console.error("❌ Error creando usuario:", insertUserError);
        return res.status(500).json({ error: "Error creando usuario" });
      }

      usuario = { usuario_id: usuarioID, saldo_wld: 0 };
    }

    // 🔥 IMPORTANTE: ya NO restamos saldo aquí
    // porque World App ya debitó al usuario en blockchain.
    // Solo registramos la transacción para historial.

    // token único
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // registrar transacción
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
      telefono: telefono || null,
      created_at: new Date(),
    });

    if (insertError) {
      console.error("❌ Error registrando transacción:", insertError);
      return res.status(500).json({ error: "Error registrando transacción" });
    }

    return res.status(200).json({ ok: true, token });
  } catch (err) {
    console.error("🔥 Error en /transferir:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
