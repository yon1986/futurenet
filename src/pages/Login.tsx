import { useNavigate } from "react-router-dom";
import { IDKitWidget, VerificationResponse } from "@worldcoin/idkit";
import { useUser } from "../context/UserContext";

function Login() {
  const navigate = useNavigate();
  const { setUsuarioID, setSaldoWLD } = useUser();

  const obtenerSaldo = async (usuarioID: string) => {
    try {
      const res = await fetch("https://futurenet.vercel.app/api/saldo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioID }),
      });

      const data = await res.json();
      if (data.saldo !== undefined) {
        setSaldoWLD(data.saldo);
      } else {
        setSaldoWLD(0);
      }
    } catch (error) {
      console.error("Error obteniendo saldo:", error);
      setSaldoWLD(0);
    }
  };

  const handleVerify = async (response: VerificationResponse) => {
    console.log("Usuario verificado:", response);

    const usuarioID = response.nullifier_hash;
    setUsuarioID(usuarioID);

    // obtener saldo real de Supabase
    await obtenerSaldo(usuarioID);

    navigate("/bienvenida");
  };

  const handleDemo = async () => {
    const usuarioID = "usuario_prueba";
    setUsuarioID(usuarioID);

    // obtener saldo real de Supabase
    await obtenerSaldo(usuarioID);

    navigate("/bienvenida");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Bienvenido a <span className="text-purple-600">Futurenet</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Cambia tus <strong>Worldcoin</strong> por quetzales de forma rápida y segura.
        </p>

        <IDKitWidget
          action="futurenet-login"
          signal="login"
          onSuccess={handleVerify}
          app_id="TU_APP_ID_DE_WORLDCOIN"
        >
          {({ open }) => (
            <button
              onClick={open}
              className="w-full py-4 mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition"
            >
              🔐 Iniciar con World ID
            </button>
          )}
        </IDKitWidget>

        <button
          onClick={handleDemo}
          className="w-full py-3 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold shadow-md transition"
        >
          🚀 Continuar en modo demo
        </button>
      </div>
    </div>
  );
}

export default Login;
