import React, { useEffect, useState } from "react";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel,
} from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import QRCode from "react-qr-code";

const LoginWorldID: React.FC = () => {
  const { setUsuarioID, setWalletAddress } = useUser();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "error" | "qr">("cargando");
  const [mensaje, setMensaje] = useState("Iniciando verificación…");

  // 👇 URL de tu miniapp (para QR en escritorio)
  const appUrl = "https://futurenet.vercel.app/login-worldid";

  const ejecutarVerificacion = async () => {
    try {
      if (!MiniKit.isInstalled()) {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
          // En móvil fuera de World App → mostramos aviso
          setEstado("error");
          setMensaje("⚠️ Esta miniapp solo puede abrirse desde World App en tu celular.");
        } else {
          // En escritorio → mostrar QR
          setEstado("qr");
        }
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
      console.log("👉 Payload recibido de World App:", fp);

      // ✅ Guardamos usuario y wallet
      setUsuarioID(fp.nullifier_hash);
      if (fp.wallet_address) {
        setWalletAddress(fp.wallet_address);
        console.log("✅ Wallet Address guardada:", fp.wallet_address);
      }

      // ❌ Eliminado el fetch a Supabase (ya no sobreescribe saldo)
      // El UserContext detecta el walletAddress y obtiene el saldo real desde blockchain

      navigate("/bienvenida");
    } catch (e) {
      setEstado("error");
      setMensaje("No se pudo iniciar la verificación. Reintenta.");
    }
  };

  useEffect(() => {
    ejecutarVerificacion();
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

        {estado === "qr" && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-700 text-sm">
              Escanea este código QR con tu celular para abrir la miniapp en World App:
            </p>
            <QRCode value={appUrl} size={180} />
          </div>
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
