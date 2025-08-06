import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import Opciones from "./pages/Opciones";
import RetiroCajero from "./pages/RetiroCajero";
import RetiroCuenta from "./pages/RetiroCuenta";
import Historial from "./pages/Historial";
import { UserProvider } from "./context/UserContext";

// Pantallas adicionales
import Terminos from "./pages/Terminos";
import ComoFunciona from "./pages/ComoFunciona";
import { useEffect } from "react";

function TerminosInicio() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige a Términos con el estado "desdeInicio: true"
    navigate("/terminos", { state: { desdeInicio: true } });
  }, [navigate]);

  return null; // Pantalla intermedia sin mostrar nada
}

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <BrowserRouter>
        <UserProvider>
          <Routes>
            {/* Redirige desde "/" a Términos con estado */}
            <Route path="/" element={<TerminosInicio />} />

            {/* Resto de rutas */}
            <Route path="/login" element={<Login />} />
            <Route path="/bienvenida" element={<Bienvenida />} />
            <Route path="/opciones" element={<Opciones />} />
            <Route path="/retiro-cajero" element={<RetiroCajero />} />
            <Route path="/retiro-cuenta" element={<RetiroCuenta />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/terminos" element={<Terminos />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
