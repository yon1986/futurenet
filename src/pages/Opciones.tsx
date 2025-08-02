import { useNavigate } from "react-router-dom";

function Opciones() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Título */}
      <h1 className="text-3xl font-bold mb-3 text-gray-800 text-center">
        Bienvenido a <span className="text-blue-600">Futurenet</span>
      </h1>

      {/* Subtítulo */}
      <p className="text-gray-600 mb-6 text-center">
        Cambia tus <strong>Worldcoin</strong> por quetzales de forma rápida y segura.
      </p>

      {/* Pregunta original */}
      <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
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
