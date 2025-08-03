import { useNavigate } from "react-router-dom";
import { IDKitWidget, VerificationResponse } from "@worldcoin/idkit";
import { useUser } from "../context/UserContext";

function Login() {
  const navigate = useNavigate();
  const { setUsuarioID } = useUser();

  const handleVerify = (response: VerificationResponse) => {
    console.log("Usuario verificado:", response);

    // Guardamos el nullifier_hash del usuario de World ID
    setUsuarioID(response.nullifier_hash);

    // Navegamos a la pantalla de bienvenida
    navigate("/bienvenida");
  };

  // Función demo para simular usuario existente en Supabase
  const handleDemo = () => {
    // 👇 Aquí ponemos el mismo ID que ya está en la tabla usuarios de Supabase
    setUsuarioID("usuario_prueba");
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

        {/* Botón de World ID */}
        <IDKitWidget
          action="futurenet-login"
          signal="login"
          onSuccess={handleVerify}
          app_id="TU_APP_ID_DE_WORLDCOIN" // 👈 Reemplázalo con tu App ID real
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

        {/* Botón demo solo para desarrollo */}
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
