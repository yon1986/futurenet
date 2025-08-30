import { ethers } from "ethers";

const ALCHEMY_URL = import.meta.env.VITE_ALCHEMY_URL;
const WLD_CONTRACT = "0x163f8C2467924be0ae7B5347228CABF260318753";
const abi = ["function balanceOf(address owner) view returns (uint256)"];

export async function getSaldoReal(
  address: string,
  addDebugLog: (msg: string) => void
): Promise<number> {
  try {
    addDebugLog(`Consultando saldo real para: ${address}`);

    const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
    const contract = new ethers.Contract(WLD_CONTRACT, abi, provider);

    const rawBalance = await contract.balanceOf(address);
    addDebugLog(`rawBalance (wei): ${rawBalance.toString()}`);

    const balance = parseFloat(ethers.formatUnits(rawBalance, 18));
    addDebugLog(`Balance parseado: ${balance} WLD`);

    return balance;
  } catch (err: any) {
    addDebugLog(`❌ Error obteniendo saldo real: ${err.message}`);
    return 0;
  }
}
