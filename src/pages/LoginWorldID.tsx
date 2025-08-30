import React, { useEffect, useState } from "react";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel,
} from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const LoginWorldID: React.FC = () => {
  const { setUsuarioID, setSaldoWLD } = useUser();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "error">("cargando");
  const [mensaje, setMensaje] = useState("Iniciando verificación…");

  const ejecutarVerificacion = async () => {
    try {
      if (!MiniKit.isInstalled()) {
        setEstado("error");
        setMensaje("Abre esta Mini App desde World App.");
        return;
      }

      const payload: VerifyCommandInput = {
        action: "futurenet-login",
        verification_level: VerificationLevel.Orb,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(payload);

      if ((finalPayload as any)?.status === "error") {
        setEstado("error");
        setMensaje("La verificación fue cancelada. Intenta de nuevo.");
        return;
      }

      const fp: any = finalPayload;

      // Verificación en backend
      const resp = await fetch("/api/worldid/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: fp.proof,
          merkle_root: fp.merkle_root,
          nullifier_hash: fp.nullifier_hash,
          verification_level: fp.verification_level,
          action: "futurenet-login",
          signal_hash: fp.signal_hash,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data?.ok) {
        setEstado("error");
        setMensaje("No se pudo verificar la prueba. Intenta de nuevo.");
        return;
      }

      // ✅ Verificación confirmada → guardamos el usuario
      setUsuarioID(fp.nullifier_hash);

      // 🚀 Nuevo paso: obtener saldo real del backend
      try {
        const saldoResp = await fetch("/api/saldo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const saldoData = await saldoResp.json();
        if (saldoResp.ok && saldoData?.saldo !== undefined) {
          setSaldoWLD(saldoData.saldo);
        } else {
          console.error("Error al obtener saldo:", saldoData);
        }
      } catch (err) {
        console.error("Fallo al consultar saldo:", err);
      }

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
