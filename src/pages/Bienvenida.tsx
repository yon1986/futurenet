// src/pages/Bienvenida.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

type Estado = "checando" | "ok" | "fail";

function Bienvenida() {
  const navigate = useNavigate();
  const { usuarioID } = useUser();

  // --- DEBUG de sesión (temporal) ---
  const [estado, setEstado] = useState<Estado>("checando");
  const [detalle, setDetalle] = useState<string>("Comprobando sesión…");

  async function checarSesion() {
    try {
      setEstado("checando");
      setDetalle("Comprobando sesión…");
      const r = await fetch("/api/worldid/whoami", {
        method: "GET",
        credentials: "include", // por si acaso; same-site ya la envía igual
      });
      const data = await r.json();
      // log en consola por si quieres ver el objeto completo
      console.log("whoami →", data);
      if (data?.ok && data.authenticated) {
        setEstado("ok");
        setDetalle(`Autenticado. sub: ${data.session?.sub || "—"}`);
      } else {
        setEstado("fail");
        setDetalle("No hay cookie de sesión o es inválida.");
      }
    } catch (e) {
      setEstado("fail");
      setDetalle("Error consultando whoami.");
    }
  }
  // --- FIN DEBUG de sesión ---

  useEffect(() => {
    // Si tu flujo exige usuarioID en contexto:
    if (!usuarioID) {
      // OJO: ya vienes de /login-worldid que hace setUsuarioID.
      // Si lo quitaras en el futuro, puedes basarte solo en la cookie.
      navigate("/");
    }
  }, [usuarioID, navigate]);

  useEffect(() => {
    checarSesion();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          ¡Bienvenido a <span className="text-purple-600">Futurenet</span>!
        </h1>
        <p className="text-gray-600 mb-6">
          El cambio más confiable y seguro de tus <strong>Worldcoin</strong>.
        </p>

        <button
          onClick={() => navigate("/opciones")}
          className="w-full py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition"
        >
          Continuar
        </button>

        {/* --- Panel DEBUG temporal ---- */}
        <div className="mt-6 text-left text-sm">
          <div className="p-3 rounded-lg border">
            <p className="font-semibold mb-1">Estado de sesión (debug):</p>
            <p className={estado === "ok" ? "text-green-700" : estado === "fail" ? "text-red-700" : "text-gray-600"}>
              {detalle}
            </p>
            <button
              onClick={checarSesion}
              className="mt-3 px-3 py-2 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              Reintentar
            </button>
          </div>
        </div>
        {/* --- FIN Panel DEBUG ---- */}
      </div>
    </div>
  );
}

export default Bienvenida;
