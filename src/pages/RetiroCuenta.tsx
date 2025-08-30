import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { cobrarWLD } from "../utils/pay";

function RetiroCuenta() {
  const navigate = useNavigate();
  const { precioWLD } = useUser();

  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [confirmarCuenta, setConfirmarCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [telefono, setTelefono] = useState("");
  const [confirmarTelefono, setConfirmarTelefono] = useState("");
  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [procesando, setProcesando] = useState(false);

  // 👉 Función auxiliar para esperar confirmación del pago
  async function esperarConfirmacion(reference: string): Promise<void> {
    const deadline = Date.now() + 3 * 60 * 1000; // 3 min
    const stepMs = 3000;

    while (Date.now() < deadline) {
      const c = await fetch("/api/pay/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reference }),
      });

      if (c.status === 401) throw new Error("SESSION_EXPIRED");

      let confirm: any = {};
      try {
        confirm = await c.json();
      } catch {
        throw new Error("No se pudo leer la confirmación del pago.");
      }

      if (!c.ok) {
        if (confirm?.error === "onchain_failed") throw new Error("La transacción en la red falló.");
        throw new Error(confirm?.error || "Error confirmando el pago.");
      }

      if (confirm?.status === "confirmed") return;

      await new Promise((r) => setTimeout(r, stepMs));
    }
    throw new Error("La red está lenta. Revisa tu historial en unos minutos.");
  }

  const confirmarRetiro = async () => {
    setError("");

    // Validaciones
    if (!banco || !tipoCuenta) {
      setError("Debes seleccionar el banco y el tipo de cuenta.");
      return;
    }
    if (cuenta !== confirmarCuenta) {
      setError("El número de cuenta no coincide.");
      return;
    }
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

    const totalSinComision = cantidadWLD * precioWLD;
    const comision = totalSinComision * 0.15;
    const totalARecibir = totalSinComision - comision;

    if (totalARecibir < 1) {
      setError("El monto a recibir es demasiado bajo. Aumenta la cantidad.");
      return;
    }

    try {
      setProcesando(true);

      // 1️⃣ Cobrar WLD
      const res = await cobrarWLD(Number(cantidadWLD));
      if (res.status === "processing") {
        await esperarConfirmacion(res.reference);
      }

      // 2️⃣ Registrar retiro en backend
      const rx = await fetch("/api/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          cantidadWLD,
          tipo: "bancaria",
          montoQ: totalARecibir,
          nombre,
          banco,
          cuenta,
          tipoCuenta,
          telefono,
        }),
      });

      if (rx.status === 401) {
        setError("Tu sesión expiró. Inicia nuevamente con World ID.");
        navigate("/login-worldid");
        return;
      }

      const data = await rx.json().catch(() => ({}));
      if (rx.ok && data?.ok) {
        setTokenGenerado(data.token);
      } else {
        setError(`❌ Error: ${data?.error || "No se pudo procesar"}`);
      }
    } catch (e: any) {
      if (e?.message === "SESSION_EXPIRED") {
        setError("Tu sesión expiró. Inicia nuevamente con World ID.");
        navigate("/login-worldid");
      } else {
        setError(e?.message || "Error al procesar el pago.");
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold mb-4 text-gray-800">Retiro a Cuenta Bancaria</h1>

        {tokenGenerado ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-green-600">✅ Retiro solicitado</h2>
            <p className="mb-4">
              Tu token para reclamar el retiro es:{" "}
              <strong className="text-xl">{tokenGenerado}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Envía este token por WhatsApp al <strong>35950933</strong> para reclamar tu pago.
            </p>
            <button
              onClick={() => navigate("/historial")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ver Historial
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-3 w-full text-left">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg"
              required
            />

            <select
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Selecciona el banco</option>
              <option>Banco Industrial</option>
              <option>Banrural</option>
              <option>BAC</option>
              <option>BAM</option>
              <option>G&T</option>
              <option>Bantrab</option>
              <option>Promerica</option>
            </select>

            <select
              value={tipoCuenta}
              onChange={(e) => setTipoCuenta(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Selecciona el tipo de cuenta</option>
              <option>Monetaria</option>
              <option>Ahorro</option>
            </select>

            <input
              type="text"
              placeholder="Número de cuenta"
              value={cuenta}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setCuenta(v);
              }}
              className="p-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Confirmar número de cuenta"
              value={confirmarCuenta}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setConfirmarCuenta(v);
              }}
              className="p-3 border border-gray-300 rounded-lg"
              required
            />

            <label className="font-semibold text-sm">¿Cuántos Worldcoin deseas cambiar?</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Cantidad de WLD"
              value={cantidadWLD}
              onChange={(e) => setCantidadWLD(Number(e.target.value))}
              className="p-3 border border-gray-300 rounded-lg"
              required
            />

            <p className="text-sm text-gray-700 mt-2">
              Precio actual de WLD: <strong>Q{precioWLD.toFixed(2)}</strong>
            </p>
            <p className="text-sm text-gray-700">Comisión: <strong>15%</strong></p>
            {typeof cantidadWLD === "number" && cantidadWLD > 0 && (
              <p className="text-green-700 font-bold text-base">
                Total a recibir: Q{(cantidadWLD * precioWLD * 0.85).toFixed(2)}
              </p>
            )}

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              placeholder="Número de teléfono"
              value={telefono}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setTelefono(v);
              }}
              className="p-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              placeholder="Confirmar número de teléfono"
              value={confirmarTelefono}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setConfirmarTelefono(v);
              }}
              className="p-3 border border-gray-300 rounded-lg"
              required
            />

            <button
              type="button"
              onClick={confirmarRetiro}
              disabled={procesando}
              className={`w-full mt-3 px-6 py-3 rounded-lg text-white shadow transition ${
                procesando ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {procesando ? "Procesando..." : "Confirmar Retiro"}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-gray-500">
          💡 Recuerda consultar tu saldo en World App antes de aprobar.
        </p>

        <button
          onClick={() => navigate("/opciones")}
          className="mt-3 text-purple-700 underline text-sm"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}

export default RetiroCuenta;
