import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Bienvenida from "./pages/Bienvenida";
import Opciones from "./pages/Opciones";
import RetiroCajero from "./pages/RetiroCajero";
import RetiroCuenta from "./pages/RetiroCuenta";
import Historial from "./pages/Historial";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/bienvenida" element={<Bienvenida />} />
        <Route path="/opciones" element={<Opciones />} />
        <Route path="/retiro-cajero" element={<RetiroCajero />} />
        <Route path="/retiro-cuenta" element={<RetiroCuenta />} />
        <Route path="/historial" element={<Historial />} />
      </Routes>
    </Router>
  );
}

export default App;
