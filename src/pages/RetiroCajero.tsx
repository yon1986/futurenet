import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { cobrarWLD } from "../utils/pay";

function RetiroCajero() {
  const navigate = useNavigate();
  const {
    usuarioID,
    saldoWLD,
    setSaldoWLD,
    precioWLD,
    transacciones,
    setTransacciones,
  } = useUser();

  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");
  const [confirmarTelefono, setConfirmarTelefono] = useState("");
  const [sobrante, setSobrante] = useState<number>(0);

  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  if (!usuarioID) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  // ⬇️ Ya NO bloqueamos por saldo local aquí
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;

    const montoQ = cantidadWLD * precioWLD;
    const totalSinComision = montoQ * 0.85;
    const totalARecibir = Math.floor(totalSinComision / 50) * 50;
    const diferencia = totalSinComision - totalARecibir;

    if (totalARecibir < 50) {
      alert(
        "❌ El monto a recibir es menor al mínimo permitido de Q50.\n\nRecarga más WLD o utiliza la opción de retiro en cuenta bancaria."
      );
      return;
    }

    setSobrante(diferencia);
    setMostrarResumen(true);
  };

  const confirmarRetiro = async () => {
    if (telefono.length !== 8 || confirmarTelefono.length !== 8) {
      alert("El número de teléfono debe tener exactamente 8 dígitos.");
      return;
    }
    if (telefono !== confirmarTelefono) {
      alert("Los números de teléfono no coinciden.");
      return;
    }

    const montoQ = typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
    const totalSinComision = montoQ * 0.85;
    const totalARecibir = Math.floor(totalSinComision / 50) * 50;

    try {
      // 1) Cobrar primero la misma cantidad de WLD
      await cobrarWLD(Number(cantidadWLD));

      // 2) Luego ejecutar el retiro
      const res = await fetch("/api/transferir", {
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

      if (res.status === 401) {
        alert("Tu sesión expiró. Inicia nuevamente con World ID.");
        navigate("/login-worldid");
        return;
      }

      const data = await res.json();

      if (data.ok) {
        setSaldoWLD(data.nuevoSaldo);
        setTokenGenerado(data.token);
        setTransacciones([
          ...transacciones,
          {
            id: Date.now(),
            tipo: "cajero",
            token: data.token,
            monto: totalARecibir,
            wldCambiados: cantidadWLD,
            estado: "pendiente",
            telefono,
          },
        ]);
        setMostrarResumen(false);
      } else {
        alert(`❌ Error: ${data.error || "No se pudo procesar"}`);
      }
    } catch (e: any) {
      alert(e?.message || "Error al procesar el pago.");
    }
  };

  const montoQ = typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const totalSinComision = montoQ * 0.85;
  const totalARecibir = Math.floor(totalSinComision / 50) * 50;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-gradient-to-b from-purple-50 to-purple-100">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Retiro en Cajero</h1>
      <p className="mb-1 text-gray-700">
        Saldo disponible: <strong>{saldoWLD} WLD</strong> ≈ Q{(saldoWLD * precioWLD).toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Precio actual del WLD: <strong>Q{precioWLD}</strong>
      </p>

      {mostrarResumen ? (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-lg font-semibold text-center text-purple-700 mb-4">
            Resumen del Retiro
          </h2>
          <p><strong>Saldo disponible:</strong> {saldoWLD} WLD ≈ Q{(saldoWLD * precioWLD).toFixed(2)}</p>
          <p><strong>Precio actual del WLD:</strong> Q{precioWLD}</p>
          <p><strong>WLD a cambiar:</strong> {cantidadWLD}</p>
          <p><strong>Total sin comisión:</strong> Q{totalSinComision.toFixed(2)}</p>
          <p><strong>Comisión (15%):</strong> Q{(totalSinComision * 0.15).toFixed(2)}</p>
          <p className="text-green-700 font-bold text-base">Total a recibir: Q{totalARecibir}</p>
          <p className="text-xs mt-2 text-gray-600">
            🔒 Solo se puede retirar en múltiplos de Q50. El restante de <strong>Q{sobrante.toFixed(2)}</strong> quedará como saldo en tu cuenta Worldcoin.
          </p>

          <input
            type="tel"
            inputMode="numeric"
            maxLength={8}
            placeholder="Número de teléfono"
            value={telefono}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setTelefono(val);
            }}
            className="mt-4 p-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={8}
            placeholder="Confirmar número de teléfono"
            value={confirmarTelefono}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setConfirmarTelefono(val);
            }}
            className="p-3 border border-gray-300 rounded-lg w-full"
            required
          />

          <div className="flex justify-between mt-5">
            <button
              onClick={() => setMostrarResumen(false)}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarRetiro}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Confirmar
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            * Este cálculo es una simulación. El proceso se completa en máximo 15 minutos.
          </p>
        </div>
      ) : tokenGenerado ? (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold mb-4 text-green-600">
            ✅ Retiro solicitado
          </h2>
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <label className="font-semibold text-sm">¿Cuántos Worldcoin deseas cambiar?</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Cantidad de WLD"
            value={cantidadWLD}
            onChange={(e) => setCantidadWLD(Number(e.target.value))}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={() => navigate("/opciones")}
            className="mt-2 text-purple-700 underline text-sm"
          >
            ← Volver
          </button>
        </form>
      )}
    </div>
  );
}

export default RetiroCajero;
