// src/utils/blockchain.ts
import { ethers } from "ethers";

/**
 * Dirección oficial del contrato WLD en Optimism Mainnet
 * (fuente: documentación oficial de Worldcoin).
 */
const WLD_CONTRACT = "0x163f8C2467924be0ae7B5347228CABF260318753";

// ABI mínimo para leer el balance
const ABI = ["function balanceOf(address owner) view returns (uint256)"];

/**
 * Obtiene el saldo real de WLD en blockchain (Optimism Mainnet).
 *
 * @param wallet Dirección de la wallet del usuario.
 * @param log    Función para agregar logs de depuración.
 * @returns saldo en WLD como número decimal.
 */
export async function getSaldoReal(
  wallet: string,
  log: (msg: string) => void
): Promise<number> {
  try {
    if (!wallet) {
      log("⚠️ No se recibió dirección de wallet");
      return 0;
    }

    log(`🔎 Consultando saldo on-chain para ${wallet}`);

    // Conexión a Alchemy RPC
    const provider = new ethers.JsonRpcProvider(
      "https://opt-mainnet.g.alchemy.com/v2/Vam3qGEGpVYV-30gAp0xf"
    );

    // Contrato WLD
    const contract = new ethers.Contract(WLD_CONTRACT, ABI, provider);

    // Leer balance del usuario
    const rawBalance = await contract.balanceOf(wallet);

    // Convertir de wei (18 decimales) a número normal
    const balance = Number(ethers.formatUnits(rawBalance, 18));

    log(`✅ Saldo en blockchain: ${balance} WLD`);
    return balance;
  } catch (err: any) {
    log(`🔥 Error en getSaldoReal: ${err.message}`);
    return 0;
  }
}
