import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

interface Transaccion {
  id: number;
  tipo: string;
  token: string;
  monto_q: number;
  wld_cambiados: number;
  created_at: string;
  nombre?: string;
  banco?: string;
  cuenta?: string;
  tipo_cuenta?: string;
  telefono?: string;
}

function Historial() {
  const navigate = useNavigate();
  const { usuarioID } = useUser();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Bloquear acceso si no hay login
  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  // 📡 Obtener historial desde el backend
  useEffect(() => {
    async function fetchHistorial() {
      try {
        const resp = await fetch("/api/historial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
        });
        if (resp.ok) {
          const data = await resp.json();
          setTransacciones(data.transacciones || []);
        } else {
          console.error("Error cargando historial:", await resp.text());
        }
      } catch (e) {
        console.error("Error conectando con /api/historial:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchHistorial();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando historial...</p>
      </div>
    );
  }

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
                  <strong>{t.wld_cambiados}</strong> WLD
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Recibido en quetzales:</span>{" "}
                  Q{t.monto_q.toFixed(2)}
                </p>
                {t.tipo === "bancaria" && (
                  <>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Banco:</span> {t.banco}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Tipo de cuenta:</span>{" "}
                      {t.tipo_cuenta}
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
