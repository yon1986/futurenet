import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { format } from "date-fns";
import es from "date-fns/locale/es";

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
                <p className="text-sm mb-1">
                  <span className="font-semibold">Estado:</span>{" "}
                  {t.estado === "pendiente" ? "⏳ Pendiente" : "✅ Pagado"}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Fecha:</span>{" "}
                  {t.created_at
                    ? format(new Date(t.created_at), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })
                    : "N/A"}
                </p>

                {/* 🔗 Mostrar hash si existe */}
                {t.txHash && (
                  <p className="text-sm mb-1 break-words">
                    <span className="font-semibold">Tx Hash:</span>{" "}
                    <a
                      href={`https://optimistic.etherscan.io/tx/${t.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {t.txHash.slice(0, 10)}...{t.txHash.slice(-8)}
                    </a>
                  </p>
                )}

                {t.tipo === "bancaria" && (
                  <>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Banco:</span> {t.banco}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Tipo de cuenta:</span>{" "}
                      {t.tipoCuenta}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Cuenta:</span> {t.cuenta}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Nombre:</span> {t.nombre}
                    </p>
                  </>
                )}
                {t.tipo === "cajero" && (
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Teléfono:</span>{" "}
                    {t.telefono}
                  </p>
                )}
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
