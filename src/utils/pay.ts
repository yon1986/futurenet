// src/utils/pay.ts
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from "@worldcoin/minikit-js";

/**
 * Cobra 'amountWLD' al usuario dentro de World App usando MiniKit Pay.
 * 1) pide un reference al backend (/api/pay/initiate)
 * 2) ejecuta Pay en World App
 * 3) confirma en backend (/api/pay/confirm) y acredita saldo en 'usuarios'
 */
export async function cobrarWLD(amountWLD: number) {
  if (!MiniKit.isInstalled()) {
    throw new Error("Abre esta mini app desde World App para poder pagar.");
  }
  if (!amountWLD || amountWLD <= 0) {
    throw new Error("Monto inválido.");
  }

  // 1) reference + address destino desde backend
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

  // 3) Confirmar en backend (verifica en Developer Portal y acredita saldo)
  const c = await fetch("/api/pay/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ payload: finalPayload }),
  });
  const confirm = await c.json();
  if (!c.ok || !confirm?.ok) {
    throw new Error(confirm?.error || "No se pudo confirmar el pago.");
  }

  return confirm; // { ok:true, credited, saldo, tx }
}
