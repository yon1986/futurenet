import React, { createContext, useContext, useState } from "react";

interface Transaccion {
  id: number;
  tipo: "cajero" | "cuenta";
  token: string;
  monto: number;
  wldCambiados: number | string;
  estado: "pendiente" | "completado";
}

interface UserContextType {
  usuarioID: string | null;
  setUsuarioID: (value: string | null) => void;
  saldoWLD: number;
  setSaldoWLD: (value: number) => void;
  precioWLD: number;
  setPrecioWLD: (value: number) => void;
  transacciones: Transaccion[];
  setTransacciones: (t: Transaccion[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usamos el usuario de prueba que creamos en Supabase
  const [usuarioID, setUsuarioID] = useState<string | null>("usuario_prueba");
  const [saldoWLD, setSaldoWLD] = useState<number>(10);
  const [precioWLD, setPrecioWLD] = useState<number>(25);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  return (
    <UserContext.Provider
      value={{
        usuarioID,
        setUsuarioID,
        saldoWLD,
        setSaldoWLD,
        precioWLD,
        setPrecioWLD,
        transacciones,
        setTransacciones,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
  return context;
};
