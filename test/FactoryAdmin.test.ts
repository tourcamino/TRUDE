import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TRUDE: Factory Admin & Authorization", function () {
  it("validates admin setters, pausing, and restricted calls", async function () {
    const [owner, ledger, other] = await ethers.getSigners();

    // Deploy USDC
    const USDCMock = await ethers.getContractFactory("USDCMock");
    const usdc = (await USDCMock.deploy(1_000_000n * 10n ** 6n)) as any;
    await usdc.waitForDeployment();

    // Deploy and initialize Factory
    const TrudeFactory = await ethers.getContractFactory("TrudeFactory");
    const factory = (await TrudeFactory.deploy()) as any;
    await factory.waitForDeployment();
    await (await factory.initialize(await owner.getAddress(), await ledger.getAddress(), 10_000_000)).wait();

    // 1) createVault with zero token should revert
    await expect(factory.createVault(ethers.ZeroAddress)).to.be.reverted;

    // Create a valid vault
    const createTx = await factory.createVault(await usdc.getAddress());
    const receipt = await createTx.wait();
    const vaultAddr = (receipt!.logs[0] as any).args![0] as string;

    // 2) registerProfitFor onlyOwner; ledger should be unauthorized
    await expect(factory.connect(ledger).registerProfitFor(vaultAddr, await other.getAddress(), 10_000_000)).to.be.reverted;

    // 3) Paused factory blocks registerProfitFor
    await (await factory.connect(ledger).pause()).wait();
    await expect(factory.registerProfitFor(vaultAddr, await other.getAddress(), 10_000_000)).to.be.reverted;
    await (await factory.connect(ledger).unpause()).wait();

    // 4) isVault enforcement: calling with non-vault address reverts
    await expect(factory.registerProfitFor(await usdc.getAddress(), await other.getAddress(), 10_000_000)).to.be.reverted;

    // 5) setAffiliateShareBps invalid (>10000) reverts
    await expect(factory.connect(owner).setAffiliateShareBps(20_000)).to.be.reverted;

    // 6) setMaxFeePercent invalid (>100) reverts
    await expect(factory.connect(owner).setMaxFeePercent(200)).to.be.reverted;

    // 7) setLedger zero address reverts
    await expect(factory.connect(owner).setLedger(ethers.ZeroAddress)).to.be.reverted;

    // 8) recordAffiliateEarning only callable from a vault; direct call should revert
    await expect(factory.recordAffiliateEarning(await other.getAddress(), 5_000_000)).to.be.reverted;
  });
});