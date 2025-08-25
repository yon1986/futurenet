// src/pages/LoginWorldID.tsx
import React, { useEffect, useRef } from "react";
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import { useNavigate } from "react-router-dom";
// ⚠️ Aún no tocamos tu UserContext; cuando nos lo pases lo integramos aquí:
import { useUser } from "../context/UserContext";

const LoginWorldID: React.FC = () => {
  const { setUsuarioID } = useUser();
  const navigate = useNavigate();
  const openRef = useRef<null | (() => void)>(null);

  // Auto-abrir modal al montar
  useEffect(() => {
    const id = setTimeout(() => openRef.current?.(), 200);
    return () => clearTimeout(id);
  }, []);

  const onSuccess = (result: ISuccessResult) => {
    // Guardamos el usuario (luego lo afinamos cuando nos compartas tu UserContext)
    setUsuarioID(result.nullifier_hash);
    navigate("/bienvenida");
  };

  const handleVerify = async (result: ISuccessResult) => {
    console.log("🔍 Proof recibido (enviar a backend más adelante):", result);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Inicia sesión con <span className="text-purple-600">World ID</span>
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Abriendo el verificador… Si no se abre, toca el botón.
        </p>

        <IDKitWidget
          app_id="app_16e531ba60f3f22005fa73b1bd8fb93f"
          action="futurenet-login"
          verification_level={VerificationLevel.Orb}
          handleVerify={handleVerify}
          onSuccess={onSuccess}
          language="es"
        >
          {({ open }) => {
            openRef.current = open;
            return (
              <button
                onClick={open}
                className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold shadow-lg transition"
              >
                🌍 Iniciar con World ID
              </button>
            );
          }}
        </IDKitWidget>

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
