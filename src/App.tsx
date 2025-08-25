// src/App.tsx
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { UserProvider } from "./context/UserContext";

// Páginas existentes
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import Opciones from "./pages/Opciones";
import RetiroCajero from "./pages/RetiroCajero";
import RetiroCuenta from "./pages/RetiroCuenta";
import Historial from "./pages/Historial";
import Terminos from "./pages/Terminos";
import ComoFunciona from "./pages/ComoFunciona";

// Nueva página (World ID)
import LoginWorldID from "./pages/LoginWorldID";

function TerminosInicio() {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirige a Términos con el estado { desdeInicio: true }
    navigate("/terminos", { state: { desdeInicio: true } });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <BrowserRouter>
        <UserProvider>
          <Routes>
            {/* Inicio → Términos */}
            <Route path="/" element={<TerminosInicio />} />

            {/* Logins */}
            <Route path="/login" element={<Login />} />
            <Route path="/login-worldid" element={<LoginWorldID />} />

            {/* Flujo normal */}
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
