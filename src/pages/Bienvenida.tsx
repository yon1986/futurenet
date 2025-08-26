// src/pages/Bienvenida.tsx (sin panel debug)
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";

function Bienvenida() {
  const navigate = useNavigate();
  const { usuarioID } = useUser();

  useEffect(() => {
    if (!usuarioID) navigate("/");
  }, [usuarioID, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          ¡Bienvenido a <span className="text-purple-600">Futurenet</span>!
        </h1>
        <p className="text-gray-600 mb-6">
          El cambio más confiable y seguro de tus <strong>Worldcoin</strong>.
        </p>
        <button
          onClick={() => navigate("/opciones")}
          className="w-full py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default Bienvenida;
