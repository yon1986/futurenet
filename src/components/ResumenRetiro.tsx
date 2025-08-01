import { useState } from "react";

interface Props {
  monto: number;
  total: number;
  onConfirmar: (telefono: string) => void;
  onCancelar: () => void;
}

function ResumenRetiro({ monto, total, onConfirmar, onCancelar }: Props) {
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");

  const handleConfirmar = () => {
    if (tel1 !== tel2 || tel1 === "") {
      alert("El número de teléfono no coincide.");
      return;
    }
    onConfirmar(tel1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Resumen del Retiro</h2>
      <p className="text-gray-700">
        Monto solicitado: <strong>Q{monto}</strong>
      </p>
      <p className="text-gray-700 mt-1">
        <strong>Recibes Q{total}</strong>
      </p>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Número de teléfono"
          value={tel1}
          onChange={(e) => setTel1(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full mb-2 focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
        />
        <input
          type="text"
          placeholder="Confirmar número de teléfono"
          value={tel2}
          onChange={(e) => setTel2(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
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
          className="px-4 py-2 bg-[#0d6efd] text-white rounded-lg hover:bg-blue-700 transition"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default ResumenRetiro;
