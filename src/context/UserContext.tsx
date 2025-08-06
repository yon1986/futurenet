import { createContext, useContext, useState, ReactNode } from "react";

interface Transaccion {
  id: number;
  tipo: string;
  token: string;
  monto: number;
  wldCambiados: number;
  estado: string;
  // Campos extra opcionales
  telefono?: string;
  nombre?: string;
  banco?: string;
  cuenta?: string;
  tipoCuenta?: string;
}

interface UserContextType {
  usuarioID: string | null;
  setUsuarioID: (id: string | null) => void;
  saldoWLD: number;
  setSaldoWLD: (saldo: number) => void;
  precioWLD: number;
  transacciones: Transaccion[];
  setTransacciones: (t: Transaccion[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [usuarioID, setUsuarioIDState] = useState<string | null>(null);
  const [saldoWLD, setSaldoWLDState] = useState<number>(0);
  const [precioWLD] = useState<number>(8); // Precio fijo de ejemplo
  const [transacciones, setTransaccionesState] = useState<Transaccion[]>([]);

  const setUsuarioID = (id: string | null) => {
    setUsuarioIDState(id);
    if (id) {
      localStorage.setItem("usuarioID", id);
    } else {
      localStorage.removeItem("usuarioID");
    }
  };

  const setSaldoWLD = (saldo: number) => {
    setSaldoWLDState(saldo);
  };

  const setTransacciones = (t: Transaccion[]) => {
    setTransaccionesState(t);
  };

  return (
    <UserContext.Provider
      value={{
        usuarioID,
        setUsuarioID,
        saldoWLD,
        setSaldoWLD,
        precioWLD,
        transacciones,
        setTransacciones,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
}
