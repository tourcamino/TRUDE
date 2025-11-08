import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TRUDE: Vault Edge Cases", function () {
  it("handles deposit/withdraw reverts and authorization checks", async function () {
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
    const created = rc!.logs.find((l: any) => (l as any).fragment && (l as any).fragment.name === "VaultCreated");
    const vaultAddr = created ? (created as any).args![0] : (await factory.createVault(await usdc.getAddress())).wait().then((r: any) => r!.logs[0].args![0]);

    // Attach vault
    const TrudeVault = await ethers.getContractFactory("TrudeVault");
    const vault = TrudeVault.attach(vaultAddr as string) as any;

    // 1) Deposit zero should revert
    await (await usdc.connect(user).approve(vaultAddr as string, 10_000_000)).wait();
    await expect(vault.connect(user).deposit(0)).to.be.reverted;

    // 2) Deposit below minDeposit should revert
    await expect(vault.connect(user).deposit(5_000_000)).to.be.reverted; // 5 USDC < 10 USDC

    // 3) Deposit above minDeposit succeeds (ensure sufficient allowance)
    await (await usdc.connect(user).approve(vaultAddr as string, 50_000_000)).wait();
    await expect(vault.connect(user).deposit(20_000_000)).to.emit(vault, "Deposit"); // 20 USDC

    // 4) Pause vault blocks deposit and withdrawProfit
    await (await vault.connect(ledger).pause()).wait();
    await expect(vault.connect(user).deposit(20_000_000)).to.be.reverted;
    await expect(vault.connect(user).withdrawProfit()).to.be.reverted;

    // 5) Unpause restores operations; but withdrawProfit without profit should revert
    await (await vault.connect(owner).unpause()).wait();
    await expect(vault.connect(user).withdrawProfit()).to.be.reverted; // NoProfit

    // 6) OnlyFactory can register profit; direct call should revert
    await expect(vault.connect(owner).registerProfit(await user.getAddress(), 10_000_000)).to.be.reverted;

    // 7) Deposit without approval should revert (insufficient allowance)
    await (await usdc.connect(user).approve(vaultAddr as string, 0)).wait();
    await expect(vault.connect(user).deposit(10_000_000)).to.be.reverted;
  });
});