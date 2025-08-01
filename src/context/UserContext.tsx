import React, { createContext, useContext, useState } from "react";

interface Transaccion {
  id: number;
  tipo: "cajero" | "cuenta";
  token: string;
  monto: number;
  estado: "pendiente" | "completado";
}

interface UserContextType {
  saldoWLD: number;
  setSaldoWLD: (value: number) => void;
  precioWLD: number;
  setPrecioWLD: (value: number) => void;
  telefono: string;
  setTelefono: (value: string) => void;
  transacciones: Transaccion[];
  setTransacciones: (t: Transaccion[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [saldoWLD, setSaldoWLD] = useState<number>(10);
  const [precioWLD, setPrecioWLD] = useState<number>(25);
  const [telefono, setTelefono] = useState<string>("");
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  return (
    <UserContext.Provider
      value={{
        saldoWLD,
        setSaldoWLD,
        precioWLD,
        setPrecioWLD,
        telefono,
        setTelefono,
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
