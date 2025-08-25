// src/pages/LoginWorldID.tsx
import React, { useEffect, useState } from "react";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const LoginWorldID: React.FC = () => {
  const { setUsuarioID } = useUser();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [mensaje, setMensaje] = useState<string>("Iniciando verificación…");

  const ejecutarVerificacion = async () => {
    try {
      // Asegúrate de abrir esto DENTRO de World App (Mini App)
      if (!MiniKit.isInstalled()) {
        setEstado("error");
        setMensaje(
          "Abrí esta Mini App desde World App para verificar con World ID."
        );
        return;
      }

      const payload: VerifyCommandInput = {
        action: "futurenet-login", // tu Action ID del portal
        verification_level: VerificationLevel.Orb, // Orb o Device
      };

      // World App abrirá un 'drawer' nativo con el botón Aprobar
      const { finalPayload } = await MiniKit.commandsAsync.verify(payload);

      if (finalPayload.status === "error") {
        setEstado("error");
        setMensaje("La verificación fue cancelada. Intenta de nuevo.");
        return;
      }

      // Éxito: obtenemos el proof y el nullifier_hash
      const result = finalPayload as ISuccessResult;

      // (Luego lo validamos en backend; por ahora guardamos el usuario)
      setUsuarioID(result.nullifier_hash);
      navigate("/bienvenida");
    } catch (e) {
      setEstado("error");
      setMensaje("No se pudo iniciar la verificación. Reintenta.");
    }
  };

  useEffect(() => {
    setEstado("cargando");
    setMensaje("Iniciando verificación…");
    ejecutarVerificacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reintentar = () => {
    setEstado("cargando");
    setMensaje("Reintentando…");
    ejecutarVerificacion();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Verificación con <span className="text-purple-600">World ID</span>
        </h1>
        <p className="text-gray-600 text-sm mb-4">{mensaje}</p>

        {estado === "error" && (
          <button
            onClick={reintentar}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold shadow-lg transition"
          >
            Reintentar verificación
          </button>
        )}

        <button
          onClick={() => navigate("/terminos")}
          className="mt-4 text-purple-700 underline text-sm"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default LoginWorldID;
