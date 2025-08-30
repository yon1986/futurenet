import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";

function Opciones() {
  const navigate = useNavigate();
  const { usuarioID, debugLogs } = useUser();

  useEffect(() => {
    if (!usuarioID) navigate("/");
  }, [usuarioID, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-6 text-gray-800">
          ¿Cómo deseas cambiar tus Worldcoin?
        </h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/retiro-cuenta")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Retiro en cuenta bancaria
          </button>

          <button
            onClick={() => navigate("/retiro-cajero")}
            className="w-full py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition leading-tight"
          >
            <div className="text-base font-semibold">Retiro en cajero</div>
            <div className="text-xs text-green-100">(Transferencia móvil)</div>
          </button>

          <button
            onClick={() => navigate("/historial")}
            className="w-full py-3 bg-gray-300 text-gray-800 rounded-xl shadow hover:bg-gray-400 transition"
          >
            Ver Historial
          </button>
        </div>

        {/* 🔎 DEBUG MODE */}
        <div className="mt-6 text-left bg-gray-100 p-3 rounded-lg max-h-40 overflow-y-auto text-xs text-gray-700">
          <p className="font-semibold mb-1">🪵 Debug logs:</p>
          {debugLogs.length === 0 ? (
            <p className="text-gray-500">Sin logs</p>
          ) : (
            debugLogs.map((log, i) => <p key={i}>• {log}</p>)
          )}
        </div>
      </div>
    </div>
  );
}

export default Opciones;
