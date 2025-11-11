import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TRUDE: Withdraw Capital flow", function () {
  it("allows user to withdraw principal anytime, including when paused, applying 0.1% fee", async function () {
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
    await (
      await factory.initialize(
        await owner.getAddress(),
        await ledger.getAddress(),
        10_000_000 // minDeposit = 10 USDC
      )
    ).wait();

    // Create a Vault via factory
    const tx = await factory.createVault(await usdc.getAddress());
    const rc = await tx.wait();
    const created = rc!.logs.find(
      (l: any) => (l as any).fragment && (l as any).fragment.name === "VaultCreated"
    );
    const vaultAddr = created
      ? (created as any).args![0]
      : (await factory.createVault(await usdc.getAddress()))
          .wait()
          .then((r: any) => r!.logs[0].args![0]);

    // Attach vault
    const TrudeVault = await ethers.getContractFactory("TrudeVault");
    const vault = TrudeVault.attach(vaultAddr as string) as any;

    // Register affiliate for the user (should not impact capital withdrawals)
    await (
      await factory.registerAffiliate(
        await user.getAddress(),
        await affiliate.getAddress()
      )
    ).wait();

    // User approves vault and deposits USDC (principal)
    await (await usdc.connect(user).approve(vaultAddr as string, 100_000_000)).wait(); // 100 USDC
    await expect(vault.connect(user).deposit(50_000_000)).to.emit(vault, "Deposit"); // 50 USDC

    // Track balances before capital withdraw
    const ownerBefore = await usdc.balanceOf(await owner.getAddress());
    const affiliateBefore = await usdc.balanceOf(await affiliate.getAddress());
    const userBefore = await usdc.balanceOf(await user.getAddress());

    // Pause the vault (by ledger) to ensure capital withdraw works while paused
    await expect(vault.connect(ledger).pause()).to.emit(vault, "Paused");

    // Withdraw part of principal while paused
    await expect(vault.connect(user).withdrawCapital(20_000_000)).to.emit(
      vault,
      "CapitalWithdraw"
    ); // 20 USDC

    // Balances after withdraw
    const ownerAfter = await usdc.balanceOf(await owner.getAddress());
    const affiliateAfter = await usdc.balanceOf(await affiliate.getAddress());
    const userAfter = await usdc.balanceOf(await user.getAddress());

    // Fee on capital: 0.1% of 20 USDC = 20,000 units (6 decimals)
    expect(ownerAfter - ownerBefore).to.equal(20_000);
    // No affiliate share on capital fee
    expect(affiliateAfter - affiliateBefore).to.equal(0);

    // User receives withdrawn principal minus fee
    expect(userAfter - userBefore).to.equal(19_980_000);

    // TVL reduced by capital amount
    const tvl = await vault.totalValueLocked();
    expect(tvl).to.equal(50_000_000 - 20_000_000);

    // Remaining balance allows further withdraws when unpaused
    await expect(vault.connect(ledger).unpause()).to.emit(vault, "Unpaused");
    await expect(vault.connect(user).withdrawCapital(10_000_000)).to.emit(
      vault,
      "CapitalWithdraw"
    ); // another 10 USDC (fee 10,000)

    const tvl2 = await vault.totalValueLocked();
    expect(tvl2).to.equal(50_000_000 - 20_000_000 - 10_000_000);

    // Edge case: cannot withdraw more than remaining principal
    await expect(
      vault.connect(user).withdrawCapital(50_000_000) // exceeds remaining 20 USDC
    ).to.be.revertedWithCustomError(vault, "InsufficientBalance");
  });
});