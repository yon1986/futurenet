// src/pages/Terminos.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Terminos: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const desdeInicio = location.state?.desdeInicio ?? false;

  const handleClick = () => {
    if (desdeInicio) {
      // Ir directo al login de World ID (sin pantalla intermedia)
      navigate("/login-worldid");
    } else {
      navigate("/opciones");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md max-w-lg w-full p-6 text-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-800">
          Términos y Condiciones
        </h2>

        <div className="text-sm space-y-3 text-justify">
          <p>
            Al utilizar esta aplicación, aceptas que los cambios de Worldcoin por moneda local se
            realizan a través de un proceso manual, donde un operador verifica y ejecuta el cambio
            en un plazo máximo de 15 minutos dentro del horario de atención de 7:00 am a 9:00 pm.
          </p>
          <p>
            Si realizas una solicitud fuera de ese horario, el cambio será procesado el siguiente
            día hábil dentro del mismo horario.
          </p>
          <p>
            Deberás enviar tu número de token al WhatsApp <strong>3595-0933</strong> para confirmar
            la transacción.
          </p>
          <p>
            El servicio aplica una comisión del <strong>15%</strong>, ya incluida en el cálculo
            mostrado dentro de la aplicación.
          </p>
          <p>
            Si seleccionas retiro por cajero, se te enviará un código de transferencia al WhatsApp
            proporcionado.
          </p>
          <p>
            Este servicio es operado por <strong>FUTURE NET COMPANY, S.A.</strong>, una sociedad
            registrada legalmente en Guatemala. No somos una entidad financiera ni bancaria, sino un
            servicio de intermediación digital entre usuarios.
          </p>
          <p>
            Al continuar, reconoces haber leído y aceptado estos términos. Para cualquier consulta,
            puedes escribir al WhatsApp <strong>3595-0933</strong>.
          </p>
        </div>

        <button
          onClick={handleClick}
          className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          {desdeInicio ? "Aceptar y continuar" : "← Volver"}
        </button>
      </div>
    </div>
  );
};

export default Terminos;
