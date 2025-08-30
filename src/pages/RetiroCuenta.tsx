import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import { MiniKit } from "@worldcoin/minikit-js";

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
  const [error, setError] = useState<string>("");

  const totalSinComision = typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const comision = totalSinComision * 0.15;
  const totalARecibir = totalSinComision - comision;

  const confirmarRetiro = async () => {
    setError("");

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
    if (totalARecibir < 1) {
      setError("El monto a recibir es demasiado bajo. Aumenta la cantidad.");
      return;
    }

    try {
      // 🚀 Enviamos acción a World App
      const action = {
        action: "futurenet-exchange",
        value: cantidadWLD.toString(),
      };

      const result = await MiniKit.commandsAsync.sendTransaction(action);

      if ((result as any)?.status === "error") {
        setError("❌ No tienes suficientes WLD en tu billetera. Revisa tu saldo en World App e intenta de nuevo.");
        return;
      }

      // Aquí puedes redirigir al historial o confirmación
      navigate("/historial", { replace: true });
    } catch (err) {
      setError("⚠️ Hubo un problema al procesar la transacción.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold mb-4 text-gray-800">Retiro a Cuenta Bancaria</h1>

        <form className="flex flex-col gap-3 w-full text-left">
          <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="p-3 border border-gray-300 rounded-lg" required />
          
          <select value={banco} onChange={(e) => setBanco(e.target.value)} className="p-3 border border-gray-300 rounded-lg" required>
            <option value="">Selecciona el banco</option>
            <option>Banco Industrial</option>
            <option>Banrural</option>
            <option>BAC</option>
            <option>BAM</option>
            <option>G&T</option>
            <option>Bantrab</option>
            <option>Promerica</option>
          </select>

          <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} className="p-3 border border-gray-300 rounded-lg" required>
            <option value="">Selecciona el tipo de cuenta</option>
            <option>Monetaria</option>
            <option>Ahorro</option>
          </select>

          <input type="text" placeholder="Número de cuenta" value={cuenta} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setCuenta(v); }} className="p-3 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Confirmar número de cuenta" value={confirmarCuenta} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setConfirmarCuenta(v); }} className="p-3 border border-gray-300 rounded-lg" required />

          <label className="font-semibold text-sm">¿Cuántos Worldcoin deseas cambiar?</label>
          <input type="number" step="0.01" min="0" placeholder="Cantidad de WLD" value={cantidadWLD} onChange={(e) => setCantidadWLD(Number(e.target.value))} className="p-3 border border-gray-300 rounded-lg" required />

          <p className="text-sm text-gray-700 mt-2">
            Precio actual de WLD: <strong>Q{precioWLD.toFixed(2)}</strong>
          </p>
          <p className="text-sm text-gray-700">Comisión: <strong>15%</strong></p>
          {typeof cantidadWLD === "number" && cantidadWLD > 0 && (
            <p className="text-green-700 font-bold text-base">
              Total a recibir: Q{totalARecibir.toFixed(2)}
            </p>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <input type="tel" inputMode="numeric" maxLength={8} placeholder="Número de teléfono" value={telefono} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setTelefono(v); }} className="p-3 border border-gray-300 rounded-lg" required />
          <input type="tel" inputMode="numeric" maxLength={8} placeholder="Confirmar número de teléfono" value={confirmarTelefono} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setConfirmarTelefono(v); }} className="p-3 border border-gray-300 rounded-lg" required />

          <button type="button" onClick={confirmarRetiro} className="w-full mt-3 px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
            Aprobar con World App
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          💡 Recuerda consultar tu saldo en World App antes de aprobar.
        </p>

        <button onClick={() => navigate("/opciones")} className="mt-3 text-purple-700 underline text-sm">
          ← Volver
        </button>
      </div>
    </div>
  );
}

export default RetiroCuenta;
