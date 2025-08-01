import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Opciones() {
  const navigate = useNavigate();
  const { saldoWLD, precioWLD } = useUser();

  const totalEnQuetzales = saldoWLD * precioWLD * 0.85;
  const puedeUsarCajero = totalEnQuetzales >= 50;

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-xl font-semibold mb-4 text-center">
        ¿Cómo deseas cambiar tus Worldcoin?
      </h1>

      <p className="mb-4 text-gray-700 text-center">
        Saldo actual: <strong>{saldoWLD} WLD</strong> ≈{" "}
        <strong>Recibes Q{totalEnQuetzales.toFixed(2)}</strong>
      </p>

      <button
        onClick={() => navigate("/retiro-cajero")}
        className={`w-full max-w-sm px-6 py-3 rounded-lg shadow transition ${
          puedeUsarCajero
            ? "bg-[#0d6efd] text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        disabled={!puedeUsarCajero}
      >
        Retiro en Cajero
      </button>

      {!puedeUsarCajero && (
        <p className="text-sm text-red-600 text-center mt-2">
          ❌ No puedes retirar en cajero porque el monto mínimo es Q50.
          <br />
          Puedes retirar a cuenta bancaria aunque el monto sea menor.
        </p>
      )}

      <button
        onClick={() => navigate("/retiro-cuenta")}
        className="w-full max-w-sm px-6 py-3 bg-[#0d6efd] text-white rounded-lg shadow hover:bg-blue-700 transition mt-4"
      >
        Retiro en Cuenta Bancaria
      </button>

      <button
        onClick={() => navigate("/historial")}
        className="w-full max-w-sm px-6 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition mt-6"
      >
        Ver Historial de Transacciones
      </button>
    </div>
  );
}

export default Opciones;
