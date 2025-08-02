import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
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
        <button
          onClick={handleLogin}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition"
        >
          🔐 Iniciar con World ID
        </button>
      </div>
    </div>
  );
}

export default Login;
