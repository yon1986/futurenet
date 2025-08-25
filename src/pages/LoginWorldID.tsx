// src/pages/LoginWorldID.tsx
import React from "react";
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LoginWorldID: React.FC = () => {
  const { setUsuarioID } = useUser();
  const navigate = useNavigate();

  // Se dispara cuando el modal termina correctamente
  const onSuccess = (result: ISuccessResult) => {
    // Usamos el nullifier_hash como identificador único del usuario
    setUsuarioID(result.nullifier_hash);
    navigate("/bienvenida");
  };

  // Aquí normalmente enviarías el proof a tu backend para validarlo con la API de Worldcoin
  const handleVerify = async (result: ISuccessResult) => {
    console.log("🔍 Proof recibido (envíalo a tu backend):", result);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Inicia sesión con <span className="text-purple-600">World ID</span>
        </h1>

        <IDKitWidget
          app_id="app_16e531ba60f3f22005fa73b1bd8fb93f"
          action="futurenet-login"
          verification_level={VerificationLevel.Orb}
          handleVerify={handleVerify}
          onSuccess={onSuccess}
          language="es"
        >
          {({ open }) => (
            <button
              onClick={open}
              className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold shadow-lg transition"
            >
              🌍 Iniciar con World ID
            </button>
          )}
        </IDKitWidget>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-purple-700 underline text-sm"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default LoginWorldID;
