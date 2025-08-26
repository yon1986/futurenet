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
  const total = totalSinComision - comision; // ← FIX aquí

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;
    if (!banco || !tipoCuenta) { alert("Debes seleccionar el banco y el tipo de cuenta"); return; }
    if (cuenta !== confirmarCuenta) { alert("El número de cuenta no coincide."); return; }
    if (total < 1) { alert("El monto a recibir es demasiado bajo. Aumenta la cantidad a cambiar."); return; }

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
      try { confirm = await c.json(); } catch { throw new Error("No se pudo leer la confirmación del pago."); }

      if (!c.ok) {
        if (confirm?.error === "onchain_failed") throw new Error("La transacción en la red falló.");
        throw new Error(confirm?.error || "Error confirmando el pago.");
      }

      if (confirm?.status === "confirmed") return;

      await new Promise((r) => setTimeout(r, stepMs));
    }
    throw new Error("La red está lenta. Revisa tu historial en unos minutos.");
  }

  const confirmarRetiro = async () => {
    if (telefono.length !== 8 || confirmarTelefono.length !== 8) { alert("El número de teléfono debe tener exactamente 8 dígitos."); return; }
    if (telefono !== confirmarTelefono) { alert("Los números de teléfono no coinciden."); return; }
    if (typeof cantidadWLD !== "number" || cantidadWLD <= 0) return;
    if (confirmando) return;
    setConfirmando(true);

    try {
      // 1) Cobrar WLD
      const res = await cobrarWLD(Number(cantidadWLD));
      if (res.status === "processing") {
        await esperarConfirmacion(res.reference);
      }

      // 2) Ejecutar retiro (bancaria)
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

      if (rx.status === 401) { alert("Tu sesión expiró. Inicia nuevamente con World ID."); navigate("/login-worldid"); return; }

      const data = await rx.json().catch(() => ({}));
      if (rx.ok && data?.ok) {
        setSaldoWLD(data.nuevoSaldo);
        setTokenGenerado(data.token);
        setTransacciones([
          ...transacciones,
          {
            id: Date.now(),
            tipo: "bancaria",
            token: data.token,
            monto: total,
            wldCambiados: cantidadWLD,
            estado: "pendiente",
            nombre,
            banco,
            cuenta,
            tipoCuenta,
            telefono,
          },
        ]);
        setMostrarResumen(false);
        navigate("/historial", { replace: true });
      } else {
        alert(`❌ Error: ${data?.error || "No se pudo procesar"}`);
      }
    } catch (e: any) {
      if (e?.message === "SESSION_EXPIRED") { alert("Tu sesión expiró. Inicia nuevamente con World ID."); navigate("/login-worldid"); }
      else { alert(e?.message || "Error al procesar el pago."); }
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">Retiro a Cuenta Bancaria</h1>
      <p className="mb-1 text-gray-700">
        Saldo disponible: <strong>{saldoWLD} WLD</strong> ≈ Q{(saldoWLD * precioWLD).toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 mb-4">Precio actual del WLD: <strong>Q{precioWLD}</strong></p>

      {mostrarResumen ? (
        <div className="bg-white p-6 rounded-xl shadow-md text-gray-800 w-full max-w-sm text-sm text-left">
          <h2 className="text-lg font-semibold text-center text-purple-700 mb-4">Resumen del Retiro</h2>
          <p><strong>Banco:</strong> {banco}</p>
          <p><strong>Tipo de cuenta:</strong> {tipoCuenta}</p>
          <p><strong>Cuenta:</strong> {cuenta}</p>
          <p><strong>WLD a cambiar:</strong> {cantidadWLD}</p>
          <p><strong>Total sin comisión:</strong> Q{totalSinComision.toFixed(2)}</p>
          <p><strong>Comisión (15%):</strong> Q{comision.toFixed(2)}</p>
          <p className="text-green-700 font-bold text-base">Total a recibir: Q{total.toFixed(2)}</p>

          <input
            type="tel"
            inputMode="numeric"
            maxLength={8}
            placeholder="Número de teléfono"
            value={telefono}
            onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setTelefono(v); }}
            className="mt-4 p-3 border border-gray-300 rounded-lg w-full"
            required
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={8}
            placeholder="Confirmar número de teléfono"
            value={confirmarTelefono}
            onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setConfirmarTelefono(v); }}
            className="p-3 border border-gray-300 rounded-lg w-full"
            required
          />

          <div className="flex justify-between mt-5">
            <button onClick={() => setMostrarResumen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancelar</button>
            <button
              onClick={confirmarRetiro}
              disabled={confirmando}
              className={`px-4 py-2 rounded-lg text-white transition ${confirmando ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
            >
              {confirmando ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </div>
      ) : tokenGenerado ? (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold mb-4 text-green-600">✅ Retiro solicitado</h2>
          <p className="mb-4">Tu token para reclamar el retiro es: <strong className="text-xl">{tokenGenerado}</strong></p>
          <p className="text-sm text-gray-600 mb-4">Envía este token por WhatsApp al <strong>35950933</strong> para reclamar tu pago.</p>
          <button onClick={() => navigate("/historial")} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Ver Historial</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="p-3 border border-gray-300 rounded-lg" required />
          <select value={banco} onChange={(e) => setBanco(e.target.value)} className="p-3 border border-gray-300 rounded-lg" required>
            <option value="">Selecciona el banco</option>
            <option>Banco Industrial</option>
            <option>Banrural</option>
            <option>BAC</option>
            <option>BAM</option>
            <option>G&T</option>
            <option>Bantrab</option>
            <option>Promerica</option>
          </select>
          <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} className="p-3 border border-gray-300 rounded-lg" required>
            <option value="">Selecciona el tipo de cuenta</option>
            <option>Monetaria</option>
            <option>Ahorro</option>
          </select>
          <input type="text" placeholder="Número de cuenta" value={cuenta} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setCuenta(v); }} className="p-3 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Confirmar número de cuenta" value={confirmarCuenta} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) setConfirmarCuenta(v); }} className="p-3 border border-gray-300 rounded-lg" required />
          <label className="font-semibold text-sm">¿Cuántos Worldcoin deseas cambiar?</label>
          <input type="number" step="0.01" min="0" placeholder="Cantidad de WLD" value={cantidadWLD} onChange={(e) => setCantidadWLD(Number(e.target.value))} className="p-3 border border-gray-300 rounded-lg" required />
          <button type="submit" className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">Continuar</button>
          <button type="button" onClick={() => navigate("/opciones")} className="mt-2 text-purple-700 underline text-sm">← Volver</button>
        </form>
      )}
    </div>
  );
}

export default RetiroCuenta;
