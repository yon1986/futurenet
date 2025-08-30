import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { cobrarWLD } from "../utils/pay";

function RetiroCuenta() {
  const navigate = useNavigate();
  const { usuarioID, saldoWLD, setSaldoWLD, precioWLD } = useUser();

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

  useEffect(() => {
    if (!usuarioID) navigate("/");
  }, [usuarioID, navigate]);

  if (!usuarioID) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  const totalSinComision =
    typeof cantidadWLD === "number" ? cantidadWLD * precioWLD : 0;
  const comision = totalSinComision * 0.15;
  const total = totalSinComision - comision;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;
    if (!banco || !tipoCuenta) {
      alert("Debes seleccionar el banco y el tipo de cuenta");
      return;
    }
    if (cuenta !== confirmarCuenta) {
      alert("El número de cuenta no coincide.");
      return;
    }
    if (total < 1) {
      alert("El monto a recibir es demasiado bajo. Aumenta la cantidad a cambiar.");
      return;
    }

    setMostrarResumen(true);
  };

  const confirmarRetiro = async () => {
    if (telefono.length !== 8 || confirmarTelefono.length !== 8) {
      alert("El número de teléfono debe tener exactamente 8 dígitos.");
      return;
    }
    if (telefono !== confirmarTelefono) {
      alert("Los números de teléfono no coinciden.");
      return;
    }
    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;
    if (confirmando) return;
    setConfirmando(true);

    try {
      // 1) Cobrar WLD
      const res = await cobrarWLD(Number(cantidadWLD));
      if (res.status === "processing") {
        // aquí seguiría esperarConfirmacion...
      }

      // 2) Ejecutar retiro (bancaria) contra backend
      const rx = await fetch("/api/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          cantidadWLD,
          tipo: "bancaria",
          montoQ: total,
          nombre,
          banco,
          cuenta,
          tipoCuenta,
          telefono,
        }),
      });

      const rawText = await rx.text();
      console.log("📩 Respuesta cruda del backend:", rawText);

      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        alert("⚠️ El backend no devolvió JSON. Mira consola.");
        return;
      }

      if (rx.ok && data?.ok) {
        setSaldoWLD(data.saldoReal || saldoWLD);
        setTokenGenerado(data.token);
        navigate("/historial", { replace: true });
      } else {
        alert(`❌ Error: ${data?.error || "No se pudo procesar"}`);
      }
    } catch (e: any) {
      alert(e?.message || "Error al procesar el pago.");
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      {/* ... resto igual (inputs, resumen, botones) ... */}
      {/* Botón confirmar */}
      <button onClick={confirmarRetiro}>Confirmar</button>
    </div>
  );
}

export default RetiroCuenta;
