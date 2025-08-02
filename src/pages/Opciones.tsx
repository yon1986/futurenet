import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";

function Opciones() {
  const navigate = useNavigate();
  const { usuarioID } = useUser();

  // Si no hay usuarioID, regresamos al login
  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-gradient-to-b from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
        Bienvenido a <span className="text-blue-600">Futurenet</span>
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Cambia tus <strong>Worldcoin</strong> por quetzales de forma rápida y segura.
      </p>

      <h2 className="text-lg font-semibold mb-6 text-center text-gray-800">
        ¿Cómo deseas cambiar tus <span className="text-blue-600">Worldcoin</span>?
      </h2>

      <div className="w-full space-y-5 max-w-sm">
        <button
          onClick={() => navigate("/retiro-cuenta")}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition"
        >
          💳 Retiro en cuenta bancaria
        </button>

        <button
          onClick={() => navigate("/retiro-cajero")}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition"
        >
          🏧 Retiro en cajero
        </button>

        <button
          onClick={() => navigate("/historial")}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white text-lg font-semibold shadow-lg flex items-center justify-center gap-2 transition"
        >
          📜 Historial de transacciones
        </button>
      </div>
    </div>
  );
}

export default Opciones;
