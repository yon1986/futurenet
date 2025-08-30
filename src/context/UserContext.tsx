import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Transaccion {
  id: number;
  tipo: string;
  token: string;
  monto: number;
  wldCambiados: number;
  estado: string;
  telefono?: string;
  nombre?: string;
  banco?: string;
  cuenta?: string;
  tipoCuenta?: string;
}

interface UserContextType {
  usuarioID: string | null;
  setUsuarioID: (id: string | null) => void;
  walletAddress: string | null;
  setWalletAddress: (addr: string | null) => void;
  saldoWLD: number;
  setSaldoWLD: (saldo: number) => void;
  precioWLD: number;
  transacciones: Transaccion[];
  setTransacciones: (t: Transaccion[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [usuarioID, setUsuarioIDState] = useState<string | null>(null);
  const [walletAddress, setWalletAddressState] = useState<string | null>(null);
  const [saldoWLD, setSaldoWLDState] = useState<number>(0);
  const [precioWLD, setPrecioWLD] = useState<number>(8);
  const [transacciones, setTransaccionesState] = useState<Transaccion[]>([]);

  // ✅ Precio dinámico desde Binance (USD → GTQ con ajuste de -0.03)
  useEffect(() => {
    async function fetchPrecio() {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT");
        const data = await res.json();
        const precioUSD = parseFloat(data.price);
        const precioGTQ = precioUSD * 7.69 - 0.03;
        setPrecioWLD(precioGTQ);
      } catch (err) {
        console.error("Error obteniendo precio WLD:", err);
      }
    }

    fetchPrecio();
    const interval = setInterval(fetchPrecio, 60000); // cada 1 min
    return () => clearInterval(interval);
  }, []);

  const setUsuarioID = (id: string | null) => {
    setUsuarioIDState(id);
    if (id) {
      localStorage.setItem("usuarioID", id);
    } else {
      localStorage.removeItem("usuarioID");
    }
  };

  const setWalletAddress = (addr: string | null) => {
    setWalletAddressState(addr);
    if (addr) {
      localStorage.setItem("walletAddress", addr);
    } else {
      localStorage.removeItem("walletAddress");
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
        walletAddress,
        setWalletAddress,
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
