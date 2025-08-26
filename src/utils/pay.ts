// src/utils/pay.ts
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from "@worldcoin/minikit-js";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Cobra 'amountWLD' usando MiniKit Pay y NO resuelve hasta que el backend confirme (saldo acreditado).
 */
export async function cobrarWLD(amountWLD: number) {
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
    description: "Pago Futurenet",
  };

  const { finalPayload } = await MiniKit.commandsAsync.pay(payload);
  if (finalPayload.status !== "success") {
    throw new Error("Pago cancelado o fallido.");
  }

  // 3) Confirmar en backend (verifica en Portal y acredita saldo)
  let attempt = 0;
  const maxAttempts = 40;          // ~40 * 3s = 120s extra
  const stepMs = 3000;

  while (true) {
    const c = await fetch("/api/pay/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ payload: finalPayload }),
    });
    const confirm = await c.json();

    if (c.ok && (confirm?.status === "confirmed" || (confirm?.ok === true && !confirm?.status))) {
      // confirmado y saldo acreditado
      return confirm; // { ok, status:"confirmed", credited, saldo, tx }
    }

    if (c.ok && confirm?.status === "processing") {
      // todavía minando → reintenta
      attempt++;
      if (attempt > maxAttempts) {
        throw new Error("La transacción sigue confirmándose en la red. Revisa tu historial en unos minutos.");
      }
      await sleep(stepMs);
      continue;
    }

    // errores reales
    throw new Error(confirm?.error || "No se pudo confirmar el pago.");
  }
}
