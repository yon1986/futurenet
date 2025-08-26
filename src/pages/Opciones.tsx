// src/pages/Opciones.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

function Opciones() {
  const navigate = useNavigate();
  const { usuarioID, saldoWLD, precioWLD } = useUser();

  // --- Diagnóstico temporal ---
  const [testing, setTesting] = useState(false);
  const [out, setOut] = useState<string>("");

  useEffect(() => {
    if (!usuarioID) {
      navigate("/");
    }
  }, [usuarioID, navigate]);

  const probarApis = async () => {
    setTesting(true);
    setOut("Probando…");
    try {
      // 1) whoami: comprueba si hay cookie de sesión válida
      const w = await fetch("/api/worldid/whoami", {
        method: "GET",
        credentials: "same-origin",
      });
      const who = await w.json().catch(() => ({}));

      // 2) saldo: debe responder 200 si hay sesión; 401 si no
      const s = await fetch("/api/saldo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({}), // ya no se envía usuarioID
      });
      const saldoJson = await s.json().catch(() => ({}));

      setOut(
        JSON.stringify(
          {
            whoami: who,           // { ok:true, authenticated:true, session:{...} } si hay cookie
            saldo_status: s.status, // 200 si ok; 401 si no hay sesión
            saldo: saldoJson,      // { saldo: number } si 200
          },
          null,
          2
        )
      );
    } catch (e: any) {
      setOut("Error: " + (e?.message || "desconocido"));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-4 text-gray-800">
          ¿Cómo deseas cambiar tus Worldcoin?
        </h1>

        <p className="mb-1 text-gray-700">
          Saldo actual: <strong>{saldoWLD} WLD</strong> ≈ Q{(saldoWLD * precioWLD).toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Precio actual del WLD: <strong>Q{precioWLD}</strong>
        </p>

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

        {/* --- Diagnóstico (temporal) --- */}
        <div className="mt-8 space-y-2">
          <button
            onClick={() => navigate("/como-funciona")}
            className="text-sm text-gray-600 underline hover:text-gray-800 transition"
          >
            ¿Cómo funciona?
          </button>
          <br />
          <button
            onClick={() => navigate("/terminos")}
            className="text-sm text-gray-600 underline hover:text-gray-800 transition"
          >
            Términos y condiciones
          </button>

          <div className="mt-6 p-4 border rounded-lg text-left">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Diagnóstico (temporal)</p>
              <button
                onClick={probarApis}
                disabled={testing}
                className="px-3 py-2 text-xs rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                {testing ? "Probando..." : "Probar API segura"}
              </button>
            </div>
            {out && (
              <pre className="mt-3 text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                {out}
              </pre>
            )}
          </div>
        </div>
        {/* --- Fin diagnóstico --- */}
      </div>
    </div>
  );
}

export default Opciones;
