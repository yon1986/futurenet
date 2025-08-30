import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Falta el token" });
    }

    // Buscar la transacción en Supabase
    const { data, error } = await supabase
      .from("transacciones")
      .select(`
        id,
        usuario_id,
        tipo,
        monto_q,
        wld_cambiados,
        token,
        estado,
        created_at,
        nombre,
        banco,
        cuenta,
        tipo_cuenta,
        telefono
      `)
      .eq("token", token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Token no encontrado" });
    }

    return res.status(200).json({
      ok: true,
      transaccion: data,
    });
  } catch (err: any) {
    console.error("❌ Error en /validar-token:", err);
    return res
      .status(500)
      .json({ error: "Error en el servidor", details: err.message });
  }
}
