import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { MiniKit } from "@worldcoin/minikit-js";

function RetiroCajero() {
  const navigate = useNavigate();
  const { precioWLD } = useUser();

  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [telefono, setTelefono] = useState("");
  const [confirmarTelefono, setConfirmarTelefono] = useState("");
  const [error, setError] = useState<string>("");
  const [confirmando, setConfirmando] = useState(false);

  const montoQ = typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const totalSinComision = montoQ * 0.85;
  const totalARecibir = Math.floor(totalSinComision / 50) * 50;
  const sobrante = totalSinComision - totalARecibir;

  const confirmarRetiro = async () => {
    setError("");

    if (telefono.length !== 8 || confirmarTelefono.length !== 8) {
      setError("El número de teléfono debe tener exactamente 8 dígitos.");
      return;
    }
    if (telefono !== confirmarTelefono) {
      setError("Los números de teléfono no coinciden.");
      return;
    }
    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) {
      setError("Debes ingresar una cantidad válida de WLD.");
      return;
    }
    if (totalARecibir < 50) {
      setError("El monto mínimo a retirar es Q50.");
      return;
    }

    try {
      setConfirmando(true);

      // 🚀 1) Debitar con World App
      const action = {
        action: "futurenet-exchange",
        value: cantidadWLD.toString(),
      };

      const result = await MiniKit.commandsAsync.sendTransaction(action);

      if ((result as any)?.status === "error") {
        setError("❌ No tienes suficientes WLD en tu billetera. Revisa tu saldo en World App e intenta de nuevo.");
        return;
      }

      // 🚀 2) Registrar en backend
      const resp = await fetch("/api/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          cantidadWLD,
          tipo: "cajero",
          montoQ: totalARecibir,
          telefono,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        setError(`❌ Error al registrar transacción: ${data?.error || "desconocido"}`);
        return;
      }

      // 🚀 3) Redirigir al historial
      navigate("/historial", { replace: true });
    } catch (err) {
      console.error("Error en retiro cajero:", err);
      setError("⚠️ Hubo un problema al procesar la transacción.");
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm text-center">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Retiro en Cajero</h1>

        <label className="font-semibold text-sm">¿Cuántos Worldcoin deseas cambiar?</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Cantidad en WLD"
          value={cantidadWLD}
          onChange={(e) => setCantidadWLD(Number(e.target.value))}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full mb-4"
        />

        <p className="text-sm text-gray-700 mb-1">
          Precio actual de WLD: <strong>Q{precioWLD.toFixed(2)}</strong>
        </p>
        <p className="text-sm text-gray-700 mb-1">Comisión: <strong>15%</strong></p>
        {typeof cantidadWLD === "number" && cantidadWLD > 0 && (
          <>
            <p className="text-sm text-gray-700">Total a recibir: <strong>Q{totalARecibir}</strong></p>
            <p className="text-xs text-gray-500">
              🔒 Solo se puede retirar en múltiplos de Q50. El sobrante de Q{sobrante.toFixed(2)} quedará en tu billetera.
            </p>
          </>
        )}

        <input
          type="tel"
          inputMode="numeric"
          maxLength={8}
          placeholder="Número de teléfono"
          value={telefono}
          onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setTelefono(v); }}
          className="mt-4 p-3 border border-gray-300 rounded-lg w-full"
          required
        />
        <input
          type="tel"
          inputMode="numeric"
          maxLength={8}
          placeholder="Confirmar número de teléfono"
          value={confirmarTelefono}
          onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setConfirmarTelefono(v); }}
          className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
          required
        />

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          onClick={confirmarRetiro}
          disabled={confirmando}
          className={`mt-4 w-full px-6 py-3 rounded-lg text-white shadow transition ${
            confirmando ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {confirmando ? "Procesando..." : "Aprobar con World App"}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          💡 Recuerda consultar tu saldo en World App antes de aprobar.
        </p>

        <button
          onClick={() => navigate("/opciones")}
          className="mt-4 text-purple-700 underline text-sm"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}

export default RetiroCajero;
