// src/pages/ComoFunciona.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ComoFunciona: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 px-4">
      <div className="bg-white rounded-xl shadow-md max-w-md w-full p-6 text-gray-800">
        <h2 className="text-xl font-bold mb-4 text-center text-purple-800">¿Cómo funciona?</h2>
        <ul className="list-disc pl-5 text-sm space-y-2 text-left">
          <li>Elige cómo deseas recibir tu dinero: cuenta bancaria o retiro en cajero automático.</li>
          <li>Selecciona el monto que deseas retirar en Worldcoin (WLD).</li>
          <li>Llena el formulario correspondiente según la opción seleccionada.</li>
          <li><strong>Importante:</strong> si eliges retiro en cajero, asegúrate de colocar bien tu número telefónico.</li>
          <li>Si eliges cuenta bancaria, asegúrate de ingresar correctamente tu número de cuenta y entidad bancaria.</li>
          <li>Escríbenos por WhatsApp al <strong>3595-0933</strong> indicando tu número de token para reclamar el pago.</li>
          <li>Si es por retiro en cajero automático, te enviaremos el código de transferencia móvil, por mensaje de texto y WhatsApp, para que retires en cajero BI o 5B.</li>
          <li>Procesamos el retiro y te enviamos el equivalente en Quetzales, descontando una comisión del 15%.</li>
          <li>Si elegiste cuenta bancaria, recibirás el depósito directamente en tu cuenta.</li>
          <li>Los pagos se realizan en un plazo máximo de 15 minutos, dentro del horario de atención (7:00 a.m. a 9:00 p.m.).</li>
          <li>Si haces tu solicitud fuera de ese horario, se procesará al siguiente día hábil.</li>
          <li>Este servicio es operado directamente por el equipo de <strong>FUTURE NET COMPANY, S.A.</strong>. No somos una entidad financiera ni un exchange regulado.</li>
          <li><strong>FUTURE NET COMPANY, S.A.</strong> es una empresa formalmente registrada en Guatemala.</li>
        </ul>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate("/opciones")}
            className="w-full py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComoFunciona;
