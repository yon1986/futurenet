import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";

function Bienvenida() {
  const navigate = useNavigate();
  const { usuarioID } = useUser();

  // Si no hay usuarioID, regresamos al login
  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          🎉 ¡Bienvenido a <span className="text-green-600">Futurenet</span>!
        </h1>
        <p className="text-gray-600 mb-6">
          El cambio más <strong>confiable y seguro</strong> de tus Worldcoin.
        </p>
        <button
          onClick={() => navigate("/opciones")}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-semibold shadow-lg transition"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}

export default Bienvenida;
