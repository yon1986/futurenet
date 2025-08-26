// src/pages/Opciones.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWallet } from "@worldcoin/idkit";
import { ethers } from "ethers";

// contrato oficial de WLD en Optimism
const WLD_CONTRACT = "0x3030C44b3f8E8fE7A1A1e3F8D4426b6E31e0d3B9";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Tipo de cambio USD → GTQ que usa World App
const TIPO_CAMBIO_GTQ = 7.65;

function Opciones() {
  const navigate = useNavigate();
  const { address } = useWallet();

  const [saldoWLD, setSaldoWLD] = useState<number>(0);
  const [precioWLD, setPrecioWLD] = useState<number>(0);

  // Redirigir si no hay sesión iniciada
  useEffect(() => {
    if (!address) navigate("/");
  }, [address, navigate]);

  // Obtener saldo real en WLD de la blockchain
  useEffect(() => {
    if (!address) return;

    async function fetchBalance() {
      try {
        const provider = new ethers.JsonRpcProvider("https://mainnet.optimism.io");
        const contract = new ethers.Contract(WLD_CONTRACT, ERC20_ABI, provider);

        const rawBalance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        const formatted = parseFloat(ethers.formatUnits(rawBalance, decimals));

        setSaldoWLD(formatted);
      } catch (err) {
        console.error("Error obteniendo saldo:", err);
      }
    }

    fetchBalance();
  }, [address]);

  // Obtener precio WLD en GTQ (ajustado al que usa World App)
  useEffect(() => {
    async function fetchPrecio() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=worldcoin&vs_currencies=usd"
        );
        const data = await res.json();
        const precioUSD = data.worldcoin.usd;

        // Conversión a Quetzales con el tipo de cambio de World App
        const precioGTQ = precioUSD * TIPO_CAMBIO_GTQ;

        setPrecioWLD(precioGTQ);
      } catch (err) {
        console.error("Error obteniendo precio WLD:", err);
      }
    }

    fetchPrecio();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold mb-4 text-gray-800">
          ¿Cómo deseas cambiar tus Worldcoin?
        </h1>

        <p className="mb-1 text-gray-700">
          Saldo actual:{" "}
          <strong>{saldoWLD.toFixed(4)} WLD</strong>{" "}
          ≈ Q{precioWLD ? (saldoWLD * precioWLD).toFixed(2) : "Cargando..."}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Precio actual del WLD:{" "}
          <strong>Q{precioWLD ? precioWLD.toFixed(2) : "Cargando..."}</strong>
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/retiro-cuenta")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Retiro en cuenta bancaria
          </button>

          <button
            onClick={() => navigate("/retiro-cajero")}
            className="w-full py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition leading-tight"
          >
            <div className="text-base font-semibold">Retiro en cajero</div>
            <div className="text-xs text-green-100">(Transferencia móvil)</div>
          </button>

          <button
            onClick={() => navigate("/historial")}
            className="w-full py-3 bg-gray-300 text-gray-800 rounded-xl shadow hover:bg-gray-400 transition"
          >
            Ver Historial
          </button>
        </div>

        <div className="mt-8 space-y-2">
          <button
            onClick={() => navigate("/como-funciona")}
            className="text-sm text-gray-600 underline hover:text-gray-800 transition"
          >
            ¿Cómo funciona?
          </button>
          <br />
          <button
            onClick={() => navigate("/terminos")}
            className="text-sm text-gray-600 underline hover:text-gray-800 transition"
          >
            Términos y condiciones
          </button>
        </div>
      </div>
    </div>
  );
}

export default Opciones;
