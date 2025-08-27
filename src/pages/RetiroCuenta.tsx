// src/pages/RetiroCuenta.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { cobrarWLD } from "../utils/pay";

function RetiroCuenta() {
  const navigate = useNavigate();
  const { usuarioID, saldoWLD, setSaldoWLD, precioWLD, transacciones, setTransacciones } = useUser();

  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [confirmarCuenta, setConfirmarCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [telefono, setTelefono] = useState("");
  const [confirmarTelefono, setConfirmarTelefono] = useState("");
  const [cantidadWLD, setCantidadWLD] = useState<number | "">("");
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => { if (!usuarioID) navigate("/"); }, [usuarioID, navigate]);
  if (!usuarioID) return <div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>;

  const totalSinComision = typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const comision = totalSinComision * 0.15;
  const total = totalSinComision - comision;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;
    if (!banco || !tipoCuenta) { alert("Debes seleccionar el banco y el tipo de cuenta"); return; }
    if (cuenta !== confirmarCuenta) { alert("El número de cuenta no coincide."); return; }
    if (total < 1) { alert("El monto a recibir es demasiado bajo. Aumenta la cantidad a cambiar."); return; }
    setMostrarResumen(true);
  };

  // ... resto igual al tuyo, solo se mantiene consistente el formateo con .toFixed(2)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">Retiro a Cuenta Bancaria</h1>
      <p className="mb-1 text-gray-700">
        Saldo disponible: <strong>{saldoWLD} WLD</strong> ≈ Q{(saldoWLD * precioWLD).toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 mb-4">Precio actual del WLD: <strong>Q{precioWLD.toFixed(2)}</strong></p>

      {/* ... resto del JSX igual a tu versión */}
    </div>
  );
}

export default RetiroCuenta;
