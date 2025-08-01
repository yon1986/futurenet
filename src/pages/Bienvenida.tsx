import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Bienvenida() {
  const navigate = useNavigate();
  const { saldoWLD, precioWLD } = useUser();

  const totalQ = saldoWLD * precioWLD * 0.85;

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-xl font-semibold mb-4">Bienvenido a Futurenet</h1>
      <p className="text-gray-700 mb-6 text-center">
        Saldo disponible: <strong>{saldoWLD} WLD</strong> ≈{" "}
        <strong>Recibes Q{totalQ.toFixed(2)}</strong>
      </p>
      <button
        onClick={() => navigate("/opciones")}
        className="w-full max-w-sm px-6 py-3 bg-[#0d6efd] text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Continuar
      </button>
    </div>
  );
}

export default Bienvenida;
