// test-saldo.js
import { ethers } from "ethers";

// ✅ Dirección oficial del contrato WLD en Optimism Mainnet
const WLD_CONTRACT = "0x163f8C2467924be0ae7B5347228CABF260318753";
const ABI = ["function balanceOf(address owner) view returns (uint256)"];

// ⚠️ IMPORTANTE: acá pega tu walletAddress de World App.
// Esa dirección la ves en consola cuando haces login (LoginWorldID imprime "✅ Wallet Address obtenida: ...").
const WALLET = "0xTU_DIRECCION_DE_WALLET_AQUI";

// ✅ RPC de Alchemy que ya tenés
const provider = new ethers.JsonRpcProvider(
  "https://opt-mainnet.g.alchemy.com/v2/Vam3qGEGpVYV-30gAp0xf"
);

async function main() {
  try {
    const contract = new ethers.Contract(WLD_CONTRACT, ABI, provider);

    // Consultar balance
    const rawBalance = await contract.balanceOf(WALLET);
    const balance = Number(ethers.formatUnits(rawBalance, 18));

    console.log(`🔎 Saldo real de ${WALLET}: ${balance} WLD`);
  } catch (err) {
    console.error("🔥 Error consultando saldo:", err.message);
  }
}

main();
