import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

function RetiroCuenta() {
  const navigate = useNavigate();
  const {
    usuarioID,
    saldoWLD,
    setSaldoWLD,
    precioWLD,
    transacciones,
    setTransacciones,
  } = useUser();

  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [confirmarCuenta, setConfirmarCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);

  useEffect(() => {
    if (!usuarioID) navigate("/");
  }, [usuarioID, navigate]);

  if (!usuarioID) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  const totalSinComision =
    typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const comision = totalSinComision * 0.15;
  const total = totalSinComision - comision;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;
    if (cantidadWLD > saldoWLD) {
      alert(`No tienes suficiente saldo. Saldo disponible: ${saldoWLD} WLD`);
      return;
    }
    if (!banco || !tipoCuenta) {
      alert("Debes seleccionar el banco y el tipo de cuenta");
      return;
    }
    if (cuenta !== confirmarCuenta) {
      alert("El número de cuenta no coincide.");
      return;
    }
    if (total <= 0) {
      alert("El monto a recibir es menor al mínimo permitido.");
      return;
    }

    setMostrarResumen(true);
  };

  const confirmarRetiro = async () => {
    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;

    try {
      const res = await fetch("/api/transferir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioID,
          cantidadWLD,
          tipo: "bancaria",
          montoQ: total,
          nombre,
          banco,
          cuenta,
          tipoCuenta,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSaldoWLD(data.nuevoSaldo);
        setTokenGenerado(data.token);
        setTransacciones([
          ...transacciones,
          {
            id: Date.now(),
            tipo: "bancaria",
            token: data.token,
            monto: total,
            wldCambiados: cantidadWLD,
            estado: "pendiente",
            nombre,
            banco,
            cuenta,
            tipoCuenta,
          },
        ]);
        setMostrarResumen(false);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">
        Retiro a Cuenta Bancaria
      </h1>
      <p className="mb-2 text-gray-700">
        Saldo disponible: <strong>{saldoWLD} WLD</strong> ≈ Q{(saldoWLD * 35).toFixed(2)}
      </p>

      {mostrarResumen ? (
        <div className="bg-white p-6 rounded-xl shadow-md text-gray-800 w-full max-w-sm text-sm text-left">
          <h2 className="text-lg font-semibold text-center text-purple-700 mb-4">Resumen del Retiro</h2>
          <p><strong>Banco:</strong> {banco}</p>
          <p><strong>Tipo de cuenta:</strong> {tipoCuenta}</p>
          <p><strong>Cuenta:</strong> {cuenta}</p>
          <p><strong>WLD a cambiar:</strong> {cantidadWLD}</p>
          <p><strong>Total sin comisión:</strong> Q{totalSinComision.toFixed(2)}</p>
          <p><strong>Comisión (15%):</strong> Q{comision.toFixed(2)}</p>
          <p className="text-green-700 font-bold text-base">
            Total a recibir: Q{total.toFixed(2)}
          </p>

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
            Envía este token por WhatsApp al <strong>35950933</strong> para
            reclamar tu pago.
          </p>
          <button
            onClick={() => navigate("/historial")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Ver Historial
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            onChange={(e) => setCuenta(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="text"
            placeholder="Confirmar número de cuenta"
            value={confirmarCuenta}
            onChange={(e) => setConfirmarCuenta(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <label className="font-semibold text-sm">
            ¿Cuántos Worldcoin deseas cambiar?
          </label>
          <input
            type="number"
            placeholder="Cantidad de WLD"
            value={cantidadWLD}
            onChange={(e) => setCantidadWLD(Number(e.target.value))}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <button
            type="submit"
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
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

export default RetiroCuenta;
