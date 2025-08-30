import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { action } = req.query;

  try {
    switch (action) {
      case "initiate": {
        // 👉 Lógica de initiate.ts
        const { cantidadWLD } = req.body;
        if (!cantidadWLD || cantidadWLD <= 0) {
          return res.status(400).json({ error: "Cantidad inválida" });
        }

        // Simulamos crear una referencia de pago
        const reference = Math.floor(100000 + Math.random() * 900000).toString();
        return res.status(200).json({ status: "processing", reference });
      }

      case "confirm": {
        // 👉 Lógica de confirm.ts
        const { reference } = req.body;
        if (!reference) {
          return res.status(400).json({ error: "Falta referencia" });
        }

        // Aquí normalmente iría la confirmación en blockchain
        return res.status(200).json({ status: "confirmed", reference });
      }

      case "status": {
        // 👉 Lógica de status.ts
        const { reference } = req.body;
        if (!reference) {
          return res.status(400).json({ error: "Falta referencia" });
        }

        // Simulamos que si existe → está confirmado
        return res.status(200).json({ status: "confirmed", reference });
      }

      default:
        return res.status(400).json({ error: "Acción inválida" });
    }
  } catch (e: any) {
    return res.status(500).json({ error: "Error en el servidor", details: e.message });
  }
}
