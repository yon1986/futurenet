import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectLogin = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const acepto = localStorage.getItem("aceptoTerminos");
    if (acepto !== "true") {
      navigate("/terminos", { replace: true });
    } else {
      setVerificando(false);
    }
  }, [navigate]);

  if (verificando) {
    return null; // mientras se verifica, no renderiza nada
  }

  return children;
};
