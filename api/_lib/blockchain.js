// api/_lib/blockchain.js
const { ethers } = require("ethers");

const ALCHEMY_URL = process.env.ALCHEMY_URL; // ⚡ Usa env en backend
const WLD_CONTRACT = "0x163f8C2467924be0ae7B5347228CABF260318753";
const abi = ["function balanceOf(address owner) view returns (uint256)"];

async function getSaldoReal(address) {
  try {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
    const contract = new ethers.Contract(WLD_CONTRACT, abi, provider);
    const rawBalance = await contract.balanceOf(address);
    return parseFloat(ethers.formatUnits(rawBalance, 18));
  } catch (err) {
    console.error("❌ Error getSaldoReal backend:", err.message);
    return 0;
  }
}

module.exports = { getSaldoReal };
