import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TRUDE: Withdraw Profit flow", function () {
  it("deposits, registers profit, and withdraws with fee + affiliate distribution", async function () {
    const [owner, ledger, user, affiliate] = await ethers.getSigners();

    // Deploy USDC mock with initial supply to owner
    const initialSupply = 1_000_000n * 10n ** 6n;
    const USDCMock = await ethers.getContractFactory("USDCMock");
    const usdc = (await USDCMock.deploy(initialSupply)) as any;
    await usdc.waitForDeployment();

    // Transfer some USDC to user for deposit
    await (await usdc.transfer(await user.getAddress(), 200_000n * 10n ** 6n)).wait();

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

    // Register affiliate for the user
    await (await factory.registerAffiliate(await user.getAddress(), await affiliate.getAddress())).wait();

    // User approves vault and deposits USDC to fund payouts
    await (await usdc.connect(user).approve(vaultAddr as string, 100_000_000)).wait(); // 100 USDC
    await expect(vault.connect(user).deposit(50_000_000)).to.emit(vault, "Deposit"); // 50 USDC

    // Owner forwards profit registration for user (e.g., 20 USDC)
    await expect(
      factory.connect(owner).registerProfitFor(vaultAddr as string, await user.getAddress(), 20_000_000)
    ).to.emit(vault, "ProfitRegistered");

    // Track balances before withdraw
    const ownerBefore = await usdc.balanceOf(await owner.getAddress());
    const affiliateBefore = await usdc.balanceOf(await affiliate.getAddress());
    const userBefore = await usdc.balanceOf(await user.getAddress());

    // Withdraw profit and assert event
    await expect(vault.connect(user).withdrawProfit()).to.emit(vault, "Withdraw");

    // Default fee model: dynamic fee capped by maxFeePercent (20%) and affiliateShareBps (50%).
    // For 20 USDC profit, base fee = 1% (since thresholds use 18-decimals ether scale).
    // Total fee => 0.2 USDC; affiliate gets 50% => 0.1 USDC; owner gets 0.1 USDC; user payout => 19.8 USDC.

    const ownerAfter = await usdc.balanceOf(await owner.getAddress());
    const affiliateAfter = await usdc.balanceOf(await affiliate.getAddress());
    const userAfter = await usdc.balanceOf(await user.getAddress());

    const ownerGain = ownerAfter - ownerBefore;
    const affiliateGain = affiliateAfter - affiliateBefore;
    const userGain = userAfter - userBefore;

    expect(ownerGain).to.equal(100_000); // 0.1 USDC
    expect(affiliateGain).to.equal(100_000); // 0.1 USDC
    expect(userGain).to.equal(19_800_000); // 19.8 USDC

    // TVL reduced by profit amount
    const tvl = await vault.totalValueLocked();
    expect(tvl).to.equal(50_000_000 + 20_000_000 - 20_000_000); // initial 50 + profit 20 - withdrawn 20
  });
});