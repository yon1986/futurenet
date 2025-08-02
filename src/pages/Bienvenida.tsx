import { useNavigate } from "react-router-dom";

function Bienvenida() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          ¡Bienvenido a <span className="text-blue-600">Futurenet</span>!
        </h1>
        <p className="text-gray-600 mb-6">
          El cambio más confiable y seguro de tus <strong>Worldcoin</strong>.
        </p>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          ¿Cómo deseas cambiar tus Worldcoin?
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/retiro-cuenta")}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-semibold shadow-lg transition"
          >
            💳 Retiro en cuenta bancaria
          </button>

          <button
            onClick={() => navigate("/retiro-cajero")}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition"
          >
            🏧 Retiro en cajero
          </button>
        </div>
      </div>
    </div>
  );
}

export default Bienvenida;
