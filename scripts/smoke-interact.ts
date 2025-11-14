import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [user] = await ethers.getSigners();
  const deployments = require("../src/generated/deployments.local.json");
  const token = await ethers.getContractAt("USDCMock", deployments.contracts.USDCMock);
  const vault = await ethers.getContractAt("TrudeVault", deployments.contracts.TrudeVault);
  const amount = 10_000_000; // 10 USDC in smallest unit
  const tx1 = await (token as any).approve(await vault.getAddress(), amount);
  await tx1.wait();
  const tx2 = await (vault as any).deposit(amount);
  const rc2 = await tx2.wait();
  console.log("Smoke deposit on Sepolia ok:", rc2?.transactionHash);
}

main().catch((e) => { console.error(e); process.exit(1); });
