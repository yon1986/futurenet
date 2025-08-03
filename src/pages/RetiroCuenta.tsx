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

  // 🔒 Bloquear acceso si no hay login
  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [confirmarCuenta, setConfirmarCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const montoQuetzales =
    typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const total = montoQuetzales * 0.85;

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
      alert("El número de cuenta no coincide. Por favor verifica.");
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
          tipo: "retiro", // unificamos el tipo
          montoQ: total,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSaldoWLD(data.nuevoSaldo);

        setTransacciones([
          ...transacciones,
          {
            id: Date.now(),
            tipo: "cuenta",
            token: data.token,
            monto: total,
            wldCambiados: cantidadWLD,
            estado: "pendiente",
          },
        ]);

        alert(`✅ Retiro a Cuenta Bancaria solicitado.
👤 Nombre: ${nombre}
🏦 Banco: ${banco}
📂 Tipo de cuenta: ${tipoCuenta}
💳 Cuenta: ${cuenta}
🔑 TOKEN: ${data.token}
📲 Indique su número de token al WhatsApp 35950933 para reclamar su pago y tome captura.`);

        navigate("/historial");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-xl font-semibold mb-4">Retiro a Cuenta Bancaria</h1>
      <p className="mb-2 text-gray-700">
        Saldo disponible: <strong>{saldoWLD} WLD</strong>
      </p>
      <p className="mb-6 text-gray-700">
        Precio actual WLD: <strong>Q{precioWLD}</strong>
      </p>

      {mostrarResumen ? (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold mb-4">Resumen del Retiro</h2>
          <p className="mb-4">
            Total a recibir (comisión 15% incluido):{" "}
            <strong>Q{total.toFixed(2)}</strong>
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMostrarResumen(false)}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarRetiro}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Confirmar
            </button>
          </div>
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
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            required
          />

          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            required
          >
            <option value="">Selecciona el banco</option>
            <option>Banco Industrial</option>
            <option>Banrural</option>
            <option>Gyt</option>
            <option>BAC</option>
            <option>BAM</option>
            <option>Inmobiliario</option>
            <option>Inter</option>
            <option>Ficohsa</option>
            <option>Vivibanco</option>
            <option>Antigua</option>
            <option>Nexa</option>
            <option>Azteca</option>
            <option>INV</option>
            <option>Credicorp</option>
            <option>Bantrab</option>
            <option>Promerica</option>
            <option>CHN</option>
            <option>CITIBANK</option>
            <option>Multimoney</option>
          </select>

          <select
            value={tipoCuenta}
            onChange={(e) => setTipoCuenta(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
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
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            required
          />
          <input
            type="text"
            placeholder="Confirmar número de cuenta"
            value={confirmarCuenta}
            onChange={(e) => setConfirmarCuenta(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
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
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            required
            min={1}
          />

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#0d6efd] text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={() => navigate("/opciones")}
            className="mt-2 text-[#0d6efd] underline text-sm"
          >
            ← Volver
          </button>
        </form>
      )}
    </div>
  );
}

export default RetiroCuenta;
