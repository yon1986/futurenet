import { useState } from "react";

interface Props {
  saldoDisponible: number;
  cantidadWLD: number;
  precioWLD: number;
  sobrante: number;
  onConfirmar: (telefono: string) => void;
  onCancelar: () => void;
}

function ResumenRetiro({
  saldoDisponible,
  cantidadWLD,
  precioWLD,
  sobrante,
  onConfirmar,
  onCancelar,
}: Props) {
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");

  const totalSinComision = cantidadWLD * precioWLD;
  const comision = totalSinComision * 0.15;
  const totalRecibir = Math.floor((totalSinComision - comision) / 50) * 50;

  const handleConfirmar = () => {
    if (tel1 !== tel2 || tel1 === "") {
      alert("El número de teléfono no coincide.");
      return;
    }
    onConfirmar(tel1);
  };

  if (cantidadWLD <= 0 || cantidadWLD > saldoDisponible) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-md text-sm">
      <h2 className="text-lg font-semibold mb-3 text-purple-700">
        Resumen del Retiro
      </h2>

      <div className="text-left space-y-1 mb-4">
        <p>
          <strong>Saldo disponible:</strong> {saldoDisponible.toFixed(2)} WLD ≈ Q
          {(saldoDisponible * precioWLD).toFixed(2)}
        </p>
        <p>
          <strong>Precio actual del WLD:</strong> Q{precioWLD}
        </p>
        <p>
          <strong>WLD a cambiar:</strong> {cantidadWLD} WLD
        </p>
        <p>
          <strong>Total sin comisión:</strong> Q{totalSinComision.toFixed(2)}
        </p>
        <p>
          <strong>Comisión (15%):</strong> Q{comision.toFixed(2)}
        </p>
        <p className="text-green-700 font-bold text-base">
          Total a recibir: Q{totalRecibir}
        </p>

        {sobrante > 0 && (
          <p className="text-gray-700 text-sm mt-2">
            🔒 Solo se puede retirar en múltiplos de Q50. El restante de{" "}
            <strong>Q{sobrante.toFixed(2)}</strong> quedará como saldo en tu
            cuenta Worldcoin.
          </p>
        )}
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Número de teléfono"
          value={tel1}
          onChange={(e) => setTel1(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Confirmar número de teléfono"
          value={tel2}
          onChange={(e) => setTel2(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex justify-between mt-5">
        <button
          onClick={onCancelar}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmar}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Confirmar
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        * Este cálculo es una simulación. El proceso se completa en máximo 15 minutos.
      </p>
    </div>
  );
}

export default ResumenRetiro;
