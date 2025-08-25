// src/pages/Login.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige siempre al login con World ID
    navigate("/login-worldid", { replace: true });
  }, [navigate]);

  return null;
}

export default Login;
