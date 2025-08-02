import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";

function Historial() {
  const navigate = useNavigate();
  const { usuarioID, transacciones } = useUser();

  // 🔒 Bloquear acceso si no hay login
  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  return (
    <div className="p-5 min-h-screen bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-xl font-bold mb-6 text-center">
        Historial de Transacciones
      </h1>
      {transacciones.length === 0 ? (
        <div className="text-center mt-10">
          <p className="mb-4 text-gray-600">No tienes transacciones aún.</p>
          <button
            onClick={() => navigate("/opciones")}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
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
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-md"
              >
                <p className="text-sm mb-1">
                  <span className="font-semibold">Tipo:</span> {t.tipo}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">WLD cambiados:</span>{" "}
                  <strong>{t.wldCambiados}</strong> WLD
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Recibido en quetzales:</span>{" "}
                  Q{t.monto.toFixed(2)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Token:</span> {t.token}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/opciones")}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
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
