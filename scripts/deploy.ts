import hre from "hardhat";
import fs from "fs";
import path from "path";
const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const ledger = signers[1] ?? deployer;
  if (!ledger) throw new Error("No signer available for ledger");
  if (!deployer) throw new Error("No signer available for deployer");
  console.log("Deploying contracts with accounts:", {
    deployer: deployer.address,
    ledger: ledger.address,
  });

  const initialSupply = 1_000_000 * 10 ** 6; // 1,000,000 USDC in smallest unit
  const USDCMock = await ethers.getContractFactory("USDCMock");
  const usdc = await USDCMock.deploy(initialSupply);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("USDCMock deployed to:", usdcAddress);

  // Deploy and initialize Factory
  const TrudeFactory = await ethers.getContractFactory("TrudeFactory");
  const factory = await TrudeFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("TrudeFactory deployed to:", factoryAddress);
  await (await (factory as any).initialize(deployer.address, ledger.address, 10_000_000)).wait(); // minDeposit = 10 USDC
  console.log("Factory initialized with owner:", deployer.address, "ledger:", ledger.address);

  // Deploy and initialize Affiliate tracker owned by Factory
  const TrudeAffiliate = await ethers.getContractFactory("TrudeAffiliate");
  const affiliate = await TrudeAffiliate.deploy();
  await affiliate.waitForDeployment();
  const affiliateAddress = await affiliate.getAddress();
  await (await (affiliate as any).initialize(factoryAddress)).wait();
  console.log("TrudeAffiliate deployed to:", affiliateAddress, "and owned by Factory");

  // Wire tracker into Factory
  await (await (factory as any).setAffiliateTracker(affiliateAddress)).wait();
  console.log("Affiliate tracker set in Factory:", affiliateAddress);

  // Create a Vault bound to USDCMock
  const tx = await (factory as any).createVault(usdcAddress);
  const rc = await tx.wait();
  const vaultCreated = rc!.logs.find((l: any) => (l as any).fragment && (l as any).fragment.name === "VaultCreated");
  const vaultAddr = vaultCreated ? (vaultCreated as any).args![0] : "";
  console.log("TrudeVault created at:", vaultAddr);

  // Persist deployments for frontend consumption
  // Use project root to avoid import.meta for TS typecheck compatibility
  const outDir = path.join(process.cwd(), "src", "generated");
  const outFile = path.join(outDir, "deployments.local.json");
  const payload = {
    network: hre.network.name,
    deployer: deployer.address,
    ledger: ledger.address,
    contracts: {
      USDCMock: usdcAddress,
      TrudeFactory: factoryAddress,
      TrudeAffiliate: affiliateAddress,
      TrudeVault: vaultAddr,
    },
  };
  try {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf-8");
    console.log("Saved deployments to:", outFile);
  } catch (err) {
    console.warn("Failed to write deployments JSON:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});