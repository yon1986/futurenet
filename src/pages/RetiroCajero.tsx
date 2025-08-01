import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ResumenRetiro from "../components/ResumenRetiro";
import { useUser } from "../context/UserContext";

function RetiroCajero() {
  const navigate = useNavigate();
  const {
    saldoWLD,
    setSaldoWLD,
    precioWLD,
    transacciones,
    setTransacciones,
  } = useUser();

  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [telefono, setTelefono] = useState("");
  const [confirmarTelefono, setConfirmarTelefono] = useState("");
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const montoQuetzales =
    typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const total = Math.floor((montoQuetzales * 0.85) / 50) * 50;

  const generarToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;

    if (cantidadWLD > saldoWLD) {
      alert(`No tienes suficiente saldo. Saldo disponible: ${saldoWLD} WLD`);
      return;
    }

    if (total < 50) {
      alert("El monto mínimo a recibir en cajero es Q50");
      return;
    }

    if (telefono === "" || confirmarTelefono === "") {
      alert("Debes ingresar y confirmar el número de teléfono");
      return;
    }

    if (telefono !== confirmarTelefono) {
      alert("El número de teléfono no coincide, por favor verifica");
      return;
    }

    setMostrarResumen(true);
  };

  const confirmarRetiro = () => {
    const token = generarToken();

    setSaldoWLD(saldoWLD - (cantidadWLD as number));
    setTransacciones([
      ...transacciones,
      {
        id: Date.now(),
        tipo: "cajero",
        token,
        monto: total,
        estado: "pendiente",
      },
    ]);

    alert(`✅ Tu retiro ha sido solicitado.
🔑 TOKEN: ${token}
📲 Indique su número de token al WhatsApp 35950933 para reclamar su pago y tome captura.`);

    navigate("/historial");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-xl font-semibold mb-4">Retiro en Cajero</h1>
      <p className="mb-2 text-gray-700">Saldo disponible: <strong>{saldoWLD} WLD</strong></p>
      <p className="mb-6 text-gray-700">Precio actual WLD: <strong>Q{precioWLD}</strong></p>

      {mostrarResumen ? (
        <ResumenRetiro
          monto={montoQuetzales}
          total={total}
          onConfirmar={confirmarRetiro}
          onCancelar={() => setMostrarResumen(false)}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
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

          <input
            type="text"
            placeholder="Número de teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            required
          />
          <input
            type="text"
            placeholder="Confirmar número de teléfono"
            value={confirmarTelefono}
            onChange={(e) => setConfirmarTelefono(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
            required
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

export default RetiroCajero;
