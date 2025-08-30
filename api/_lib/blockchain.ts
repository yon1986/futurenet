// api/_lib/blockchain.ts
import { ethers } from "ethers";

const ALCHEMY_URL = process.env.ALCHEMY_URL; // ✅ del backend, no de import.meta
const WLD_CONTRACT = "0x163f8C2467924be0ae7B5347228CABF260318753";
const abi = ["function balanceOf(address owner) view returns (uint256)"];

export async function getSaldoReal(address: string): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
    const contract = new ethers.Contract(WLD_CONTRACT, abi, provider);

    const rawBalance = await contract.balanceOf(address);
    const balance = parseFloat(ethers.formatUnits(rawBalance, 18));

    return balance;
  } catch (err: any) {
    console.error("❌ Error obteniendo saldo real (backend):", err.message);
    return 0;
  }
}
