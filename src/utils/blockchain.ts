// src/utils/blockchain.ts
import { ethers } from "ethers";

// ✅ URL de tu proyecto en Alchemy (Optimism Mainnet)
// ⚠️ Recordá definir VITE_ALCHEMY_URL en tu archivo .env
const ALCHEMY_URL = import.meta.env.VITE_ALCHEMY_URL;

// ✅ Dirección del contrato oficial de WLD en Optimism
const WLD_CONTRACT = "0x163f8C2467924be0ae7B5347228CABF260318753";

// ✅ ABI mínima solo para balanceOf
const abi = ["function balanceOf(address owner) view returns (uint256)"];

/**
 * Obtiene el saldo real de WLD de un usuario desde la blockchain
 * @param address Dirección del wallet del usuario
 * @returns número (saldo en WLD)
 */
export async function getSaldoReal(address: string): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
    const contract = new ethers.Contract(WLD_CONTRACT, abi, provider);

    const rawBalance = await contract.balanceOf(address);
    const balance = parseFloat(ethers.formatUnits(rawBalance, 18)); // WLD tiene 18 decimales
    return balance;
  } catch (err) {
    console.error("❌ Error obteniendo saldo real:", err);
    return 0;
  }
}
