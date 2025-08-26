// src/pages/LoginWorldID.tsx
import React, { useEffect, useState } from "react";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
// No cambiamos tu UserContext todavía, solo usamos setUsuarioID como acordamos
import { useUser } from "../context/UserContext";

const LoginWorldID: React.FC = () => {
  const { setUsuarioID } = useUser();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "error">("cargando");
  const [mensaje, setMensaje] = useState("Iniciando verificación…");

  const ejecutarVerificacion = async () => {
    try {
      // Debe ser true dentro de World App y con MiniKit.install() ya llamado en MiniKitProvider
      if (!MiniKit.isInstalled()) {
        setEstado("error");
        setMensaje("Abre esta Mini App desde World App.");
        return;
      }

      const payload: VerifyCommandInput = {
        action: "futurenet-login",
        verification_level: VerificationLevel.Orb, // exige verificación vía Orb
      };

      // Abre el drawer nativo con el botón "Aprobar"
      const { finalPayload } = await MiniKit.commandsAsync.verify(payload);

      // Si el usuario cancela o hay error en el drawer
      if ((finalPayload as any)?.status === "error") {
        setEstado("error");
        setMensaje("La verificación fue cancelada. Intenta de nuevo.");
        return;
      }

      // finalPayload incluye proof, nullifier_hash, merkle_root, verification_level, etc.
      const fp: any = finalPayload;

      // Enviar el proof al backend para verificación oficial
      const resp = await fetch("/api/worldid/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: fp.proof,
          merkle_root: fp.merkle_root,
          nullifier_hash: fp.nullifier_hash,
          verification_level: fp.verification_level,
          action: "futurenet-login",
          signal_hash: fp.signal_hash, // puede no venir; lo enviamos si existe
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data?.ok) {
        setEstado("error");
        setMensaje("No se pudo verificar la prueba. Intenta de nuevo.");
        return;
      }

      // ✅ Verificación confirmada por el backend
      setUsuarioID(fp.nullifier_hash);
      navigate("/bienvenida");
    } catch (e) {
      setEstado("error");
      setMensaje("No se pudo iniciar la verificación. Reintenta.");
    }
  };

  useEffect(() => {
    ejecutarVerificacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Verificación con <span className="text-purple-600">World ID</span>
        </h1>
        <p className="text-gray-600 text-sm mb-4">{mensaje}</p>

        {estado === "error" && (
          <button
            onClick={ejecutarVerificacion}
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
