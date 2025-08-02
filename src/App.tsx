import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import Opciones from "./pages/Opciones";
import RetiroCuenta from "./pages/RetiroCuenta";
import RetiroCajero from "./pages/RetiroCajero";
import Historial from "./pages/Historial";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/bienvenida" element={<Bienvenida />} />
            <Route path="/opciones" element={<Opciones />} />
            <Route path="/retiro-cuenta" element={<RetiroCuenta />} />
            <Route path="/retiro-cajero" element={<RetiroCajero />} />
            <Route path="/historial" element={<Historial />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
