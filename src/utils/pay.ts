// src/utils/pay.ts
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from "@worldcoin/minikit-js";

/**
 * Ejecuta el cobro via MiniKit Pay.
 * - Si el backend confirma enseguida → { status: "confirmed", ... }
 * - Si aún está minando → { status: "processing", payload: finalPayload }
 */
export async function cobrarWLD(amountWLD: number): Promise<
  | { status: "confirmed"; credited: number; saldo: number; reference?: string }
  | { status: "processing"; payload: any; reference?: string }
> {
  if (!MiniKit.isInstalled()) {
    throw new Error("Abre esta mini app desde World App para poder pagar.");
  }
  if (!amountWLD || amountWLD <= 0) {
    throw new Error("Monto inválido.");
  }

  // 1) reference + address desde backend
  const r = await fetch("/api/pay/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ amountWLD }),
  });
  const init = await r.json();
  if (!r.ok || !init?.ok || !init?.reference || !init?.to) {
    throw new Error(init?.error || "No se pudo iniciar el pago.");
  }

  // 2) Ejecutar Pay
  const payload: PayCommandInput = {
    reference: init.reference,
    to: init.to,
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(amountWLD, Tokens.WLD).toString(),
      },
    ],
    // network: init.network || "worldchain",
    description: "Pago Futurenet",
  };

  const { finalPayload } = await MiniKit.commandsAsync.pay(payload);
  if (finalPayload.status !== "success") {
    throw new Error("Pago cancelado o fallido.");
  }

  // 3) Confirmación rápida en backend
  const c = await fetch("/api/pay/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ payload: finalPayload }),
  });

  // maneja 401 aquí mismo
  if (c.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  const confirm = await c.json().catch(() => ({}));

  if (c.ok && confirm?.status === "confirmed") {
    return { status: "confirmed", credited: Number(confirm?.credited || 0), saldo: Number(confirm?.saldo || 0), reference: confirm?.reference };
  }
  if (c.ok && confirm?.status === "processing") {
    return { status: "processing", payload: finalPayload, reference: confirm?.reference };
  }

  throw new Error(confirm?.error || "No se pudo confirmar el pago.");
}
