import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const ledger = signers[1] ?? signers[0];
  const user = signers[2] ?? signers[0];
  if (!owner || !ledger || !user) throw new Error("Required signers are not available");
  console.log("Signers:", {
    owner: await owner.getAddress(),
    ledger: await ledger.getAddress(),
    user: await user.getAddress(),
  });

  // Deploy USDC mock and fund user
  const initialSupply = 1_000_000n * 10n ** 6n;
  const USDCMock = await ethers.getContractFactory("USDCMock");
  const usdc = await USDCMock.deploy(initialSupply);
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("USDCMock:", usdcAddr);
  await (await (usdc as any).transfer(await user.getAddress(), 100_000n * 10n ** 6n)).wait();

  // Deploy and initialize Factory
  const TrudeFactory = await ethers.getContractFactory("TrudeFactory");
  const factory = await TrudeFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("Factory:", factoryAddr);
  await (await (factory as any).initialize(await owner.getAddress(), await ledger.getAddress(), 10_000_000)).wait();

  // Create a vault bound to USDC
  const tx = await (factory as any).createVault(usdcAddr);
  const rc = await tx.wait();
  const created = rc!.logs.find((l: any) => (l as any).fragment && (l as any).fragment.name === "VaultCreated");
  const vaultAddr = created ? (created as any).args![0] : "";
  console.log("Vault:", vaultAddr);

  // Attach vault and approve/ deposit
  const TrudeVault = await ethers.getContractFactory("TrudeVault");
  const vault = TrudeVault.attach(vaultAddr as string);
  await (await (usdc as any).connect(user).approve(vaultAddr as string, 50_000n * 10n ** 6n)).wait();
  console.log("Approvals set. Depositing...");
  await (await (vault as any).connect(user).deposit(25_000_000)).wait();
  console.log("Deposit done.");

  // Register profit via Factory and withdraw
  console.log("Register profit via Factory...");
  await (await (factory as any).connect(owner).registerProfitFor(vaultAddr as string, await user.getAddress(), 10_000_000)).wait();
  console.log("Profit registered. Withdrawing...");
  await (await (vault as any).connect(user).withdrawProfit()).wait();
  console.log("Withdraw complete.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});