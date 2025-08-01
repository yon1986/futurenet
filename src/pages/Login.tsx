import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-xl font-semibold mb-6 text-center">
        Bienvenido a <span className="text-[#0d6efd]">Futurenet</span>
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        La forma más confiable y segura de cambiar tus Worldcoin
      </p>
      <button
        onClick={() => navigate("/bienvenida")}
        className="w-full max-w-sm px-6 py-3 bg-[#0d6efd] text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Continuar
      </button>
    </div>
  );
}

export default Login;
