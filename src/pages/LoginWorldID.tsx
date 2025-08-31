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
  const { setUsuarioID, setWalletAddress, setLastPayload } = useUser();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "error" | "qr">("cargando");
  const [mensaje, setMensaje] = useState("Iniciando verificación…");
  const [payloadDebug, setPayloadDebug] = useState<any>(null);

  const appUrl = "https://futurenet.vercel.app/login-worldid";

  const ejecutarVerificacion = async () => {
    try {
      if (!MiniKit.isInstalled()) {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          setEstado("error");
          setMensaje("⚠️ Esta miniapp solo puede abrirse desde World App en tu celular.");
        } else {
          setEstado("qr");
        }
        return;
      }

      // 1️⃣ Verificación World ID
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
      setPayloadDebug(fp);
      setLastPayload(fp);

      // ✅ Guardamos usuarioID localmente
      setUsuarioID(fp.nullifier_hash);

      // ✅ Guardamos sesión en backend (crea cookie fn_session)
      try {
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 👈 necesario para que el navegador guarde la cookie
          body: JSON.stringify({ payload: fp }),
        });
        console.log("✅ Sesión creada en backend");
      } catch (err) {
        console.error("❌ Error creando sesión en backend:", err);
      }

      // 2️⃣ Intentar obtener wallets
      try {
        console.log("🔎 Intentando obtener wallets con MiniKit...");
        const wallets: any = await (MiniKit as any).commandsAsync.getWallets?.();
        console.log("👉 Respuesta de getWallets:", wallets);

        if (wallets && Array.isArray(wallets) && wallets.length > 0) {
          const userWallet = wallets[0].address;
          setWalletAddress(userWallet);
          console.log("✅ Wallet Address obtenida:", userWallet);
        } else if (fp?.wallet) {
          setWalletAddress(fp.wallet);
          console.log("✅ Wallet Address obtenida desde payload:", fp.wallet);
        } else {
          console.warn("⚠️ No se encontró ninguna wallet en World App");
        }
      } catch (err) {
        console.error("❌ Error obteniendo wallets:", err);
        if (fp?.wallet) {
          setWalletAddress(fp.wallet);
          console.log("✅ Wallet Address fallback desde payload:", fp.wallet);
        }
      }

      navigate("/bienvenida");
    } catch (e) {
      console.error("❌ Error general en ejecutarVerificacion:", e);
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

        {/* 🔎 DEBUG */}
        {payloadDebug && (
          <div className="mt-6 text-left bg-gray-100 p-3 rounded-lg max-h-40 overflow-y-auto text-xs text-gray-700">
            <p className="font-semibold mb-1">🪵 Payload recibido:</p>
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payloadDebug, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginWorldID;
