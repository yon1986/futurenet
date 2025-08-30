import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSaldoReal } from "../utils/blockchain";

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
  debugLogs: string[];
  addDebugLog: (msg: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [usuarioID, setUsuarioIDState] = useState<string | null>(null);
  const [walletAddress, setWalletAddressState] = useState<string | null>(null);
  const [saldoWLD, setSaldoWLDState] = useState<number>(0);
  const [precioWLD, setPrecioWLD] = useState<number>(8);
  const [transacciones, setTransaccionesState] = useState<Transaccion[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (msg: string) => {
    console.log("🪵 DEBUG:", msg);
    setDebugLogs((prev) => [...prev, msg]);
  };

  // ✅ Precio dinámico desde Binance
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
    const interval = setInterval(fetchPrecio, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Obtener saldo real cuando tenemos walletAddress
  useEffect(() => {
    async function cargarSaldo() {
      if (walletAddress) {
        addDebugLog(`Consultando saldo en blockchain para ${walletAddress}`);
        const saldo = await getSaldoReal(walletAddress, addDebugLog);

        console.log("🔎 Saldo desde blockchain (Alchemy):", saldo); // 👈 LOG CLAVE

        setSaldoWLD(saldo);
        addDebugLog(`Saldo actualizado en contexto: ${saldo} WLD`);
      } else {
        addDebugLog("⚠️ No hay walletAddress, no se puede consultar saldo");
      }
    }
    cargarSaldo();
  }, [walletAddress]);

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
        debugLogs,
        addDebugLog,
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
