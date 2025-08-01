import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Historial() {
  const navigate = useNavigate();
  const { transacciones } = useUser();

  return (
    <div className="p-6 min-h-screen bg-[#f8f9fa]">
      <h1 className="text-xl font-semibold mb-5">Historial de Transacciones</h1>
      {transacciones.length === 0 ? (
        <div className="text-center mt-10">
          <p className="mb-4 text-gray-600">No tienes transacciones aún.</p>
          <button
            onClick={() => navigate("/opciones")}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            ← Volver
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {transacciones.map((t) => (
              <div
                key={t.id}
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                <p className="text-sm mb-1">
                  <span className="font-semibold">Tipo:</span> {t.tipo}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Monto:</span> Q
                  {t.monto.toFixed(2)}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Token:</span> {t.token}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    t.estado === "completado"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {t.estado.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/opciones")}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Volver
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Historial;
