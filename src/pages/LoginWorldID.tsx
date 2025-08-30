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
  const { setUsuarioID, setWalletAddress, setSaldoWLD } = useUser();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "error" | "qr">("cargando");
  const [mensaje, setMensaje] = useState("Iniciando verificación…");

  // 👇 Deep link (para intentar abrir World App)
  const deepLink = "worldcoin://id?action=futurenet-login";

  // 👇 Fallback: URL de tu app en Vercel
  const appUrl = "https://futurenet.vercel.app/login-worldid";

  const ejecutarVerificacion = async () => {
    try {
      if (!MiniKit.isInstalled()) {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
          // 📱 En móvil → intentar abrir con deep link
          window.location.href = deepLink;

          // ⏳ Si después de 1.5s no abrió nada → fallback a QR
          setTimeout(() => {
            setEstado("qr");
            setMensaje("No se pudo abrir World App automáticamente. Escanea el QR:");
          }, 1500);
        } else {
          // 💻 En escritorio → mostrar QR directo
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

      // ✅ Guardamos usuario y wallet
      setUsuarioID(fp.nullifier_hash);
      if (fp.wallet_address) {
        setWalletAddress(fp.wallet_address);
        console.log("✅ Wallet Address guardada:", fp.wallet_address);
      }

      // 👇 seguimos con Supabase como respaldo de saldo
      try {
        const saldoResp = await fetch("/api/saldo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const saldoData = await saldoResp.json();
        if (saldoResp.ok && saldoData?.saldo !== undefined) {
          setSaldoWLD(saldoData.saldo);
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
