import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

interface Transaccion {
  id: string;
  tipo: string;
  token: string;
  monto_q: number;
  wld_cambiados: number;
  created_at: string;
  nombre?: string | null;
  banco?: string | null;
  cuenta?: string | null;
  tipo_cuenta?: string | null;
  telefono?: string | null;
}

function Historial() {
  const navigate = useNavigate();
  const { usuarioID } = useUser();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);

  // 🔒 Bloquear acceso si no hay login
  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  // 📡 Cargar historial desde API
  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const res = await fetch("https://futurenet.vercel.app/api/historial", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuarioID }),
        });

        const data = await res.json();
        if (data.transacciones) {
          setTransacciones(data.transacciones);
        } else {
          setTransacciones([]);
        }
      } catch (error) {
        console.error("❌ Error cargando historial:", error);
        setTransacciones([]);
      } finally {
        setCargando(false);
      }
    };

    if (usuarioID) {
      obtenerHistorial();
    }
  }, [usuarioID]);

  return (
    <div className="p-5 min-h-screen bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-xl font-bold mb-6 text-center">
        Historial de Transacciones
      </h1>

      {cargando ? (
        <p className="text-center text-gray-600">Cargando...</p>
      ) : transacciones.length === 0 ? (
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
                  <span className="font-semibold">Tipo:</span>{" "}
                  {t.tipo === "cajero"
                    ? "Retiro en Cajero"
                    : "Retiro a Cuenta Bancaria"}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">WLD cambiados:</span>{" "}
                  <strong>{t.wld_cambiados}</strong> WLD
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Recibido en quetzales:</span>{" "}
                  Q{t.monto_q.toFixed(2)}
                </p>

                {/* Datos adicionales dependiendo del tipo */}
                {t.tipo === "bancaria" && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Nombre:</strong> {t.nombre}</p>
                    <p><strong>Banco:</strong> {t.banco}</p>
                    <p><strong>Cuenta:</strong> {t.cuenta}</p>
                    <p><strong>Tipo de cuenta:</strong> {t.tipo_cuenta}</p>
                  </div>
                )}

                {t.tipo === "cajero" && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Teléfono:</strong> {t.telefono}</p>
                  </div>
                )}

                <p className="text-sm mt-2">
                  <span className="font-semibold">Token:</span> {t.token}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(t.created_at).toLocaleString()}
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
