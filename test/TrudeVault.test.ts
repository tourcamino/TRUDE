import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TRUDE: Factory & Vault", function () {
  it("deploys contracts, allows deposit/pause flows, and forwards profit registration", async function () {
    const [owner, ledger, user] = await ethers.getSigners();

    // Deploy USDC mock with initial supply to owner
    const initialSupply = 1_000_000n * 10n ** 6n;
    const USDCMock = await ethers.getContractFactory("USDCMock");
    const usdc = (await USDCMock.deploy(initialSupply)) as any;
    await usdc.waitForDeployment();

    // Transfer some USDC to user
    await (await usdc.transfer(await user.getAddress(), 100_000n * 10n ** 6n)).wait();

    // Deploy and initialize Factory
    const TrudeFactory = await ethers.getContractFactory("TrudeFactory");
    const factory = (await TrudeFactory.deploy()) as any;
    await factory.waitForDeployment();
    await (await factory.initialize(await owner.getAddress(), await ledger.getAddress(), 10_000_000)).wait(); // minDeposit = 10 USDC

    // Create a Vault via factory
    const tx = await factory.createVault(await usdc.getAddress());
    const rc = await tx.wait();
    const vaultCreated = rc!.logs.find((l: any) => (l as any).fragment && (l as any).fragment.name === "VaultCreated");
    const vaultAddr = vaultCreated ? (vaultCreated as any).args![0] : (await factory.createVault(await usdc.getAddress())).wait().then((r: any) => r!.logs[0].args![0]);

    // Attach vault
    const TrudeVault = await ethers.getContractFactory("TrudeVault");
    const vault = TrudeVault.attach(vaultAddr as string) as any;

    // User approves vault to spend USDC
    await (await usdc.connect(user).approve(vaultAddr as string, 50_000n * 10n ** 6n)).wait();

    // Deposit above minDeposit
    await expect(vault.connect(user).deposit(25_000_000)).to.emit(vault, "Deposit");

    // Pause vault by ledger, deposits should revert
    await (await vault.connect(ledger).pause()).wait();
    await expect(vault.connect(user).deposit(25_000_000)).to.be.reverted;

    // Unpause by owner, deposits resume
    await (await vault.connect(owner).unpause()).wait();
    await expect(vault.connect(user).deposit(25_000_000)).to.emit(vault, "Deposit");

    // Forward profit registration via Factory (owner-controlled)
    await expect(factory.connect(owner).registerProfitFor(vaultAddr as string, await user.getAddress(), 10_000_000))
      .to.emit(vault, "ProfitRegistered");

    // User withdraws profit and events fire
    await expect(vault.connect(user).withdrawProfit()).to.emit(vault, "Withdraw");

    // Pause factory and ensure createVault reverts
    await (await factory.connect(ledger).pause()).wait();
    await expect(factory.createVault(await usdc.getAddress())).to.be.reverted;
  });
});