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

  async function esperarConfirmacion(reference: string): Promise<void> {
    const deadline = Date.now() + 3 * 60 * 1000; // 3 min
    const stepMs = 3000;

    while (Date.now() < deadline) {
      const c = await fetch("/api/pay/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reference }),
      });

      if (c.status === 401) throw new Error("SESSION_EXPIRED");

      let confirm: any = {};
      try {
        confirm = await c.json();
      } catch {
        throw new Error("No se pudo leer la confirmación del pago.");
      }

      if (!c.ok) {
        if (confirm?.error === "onchain_failed")
          throw new Error("La transacción en la red falló.");
        throw new Error(confirm?.error || "Error confirmando el pago.");
      }

      if (confirm?.status === "confirmed") return;

      await new Promise((r) => setTimeout(r, stepMs));
    }
    throw new Error("La red está lenta. Revisa tu historial en unos minutos.");
  }

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
        await esperarConfirmacion(res.reference);
      }

      // 2) Ejecutar retiro (bancaria) contra tu backend
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

      if (rx.status === 401) {
        alert("Tu sesión expiró. Inicia nuevamente con World ID.");
        navigate("/login-worldid");
        return;
      }

      const data = await rx.json().catch(() => ({}));
      if (rx.ok && data?.ok) {
        // 👇 ahora usamos el saldo real devuelto por el backend
        setSaldoWLD(data.saldoReal);
        setTokenGenerado(data.token);

        navigate("/historial", { replace: true });
      } else {
        alert(`❌ Error: ${data?.error || "No se pudo procesar"}`);
      }
    } catch (e: any) {
      if (e?.message === "SESSION_EXPIRED") {
        alert("Tu sesión expiró. Inicia nuevamente con World ID.");
        navigate("/login-worldid");
      } else {
        alert(e?.message || "Error al procesar el pago.");
      }
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">
        Retiro a Cuenta Bancaria
      </h1>
      <p className="mb-1 text-gray-700">
        Saldo disponible: <strong>{saldoWLD} WLD</strong> ≈ Q
        {(saldoWLD * precioWLD).toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Precio actual del WLD: <strong>Q{precioWLD.toFixed(2)}</strong>
      </p>

      {/* ... resto de tu formulario igual que lo tenías ... */}
    </div>
  );
}

export default RetiroCuenta;
