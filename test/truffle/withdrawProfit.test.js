const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");

contract("Truffle: Withdraw Profit with Affiliate", (accounts) => {
  it("distributes affiliate cut and fee on withdraw", async () => {
    const [owner, ledger, user, affiliate] = accounts;

    const initialSupply = 1_000_000_000n * 10n ** 6n; // 1B USDC
    const usdc = await USDCMock.new(initialSupply);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000); // 0.1 USDC min

    const tx = await factory.createVault(usdc.address, { from: owner });
    const evt = tx.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = evt.args.vault;
    const vault = await TrudeVault.at(vaultAddr);

    // Fund user and approve vault
    await usdc.transfer(user, 1_000_000, { from: owner }); // 1 USDC
    await usdc.approve(vault.address, 1_000_000, { from: user });
    await vault.deposit(1_000_000, { from: user });

    // Register affiliate for user
    await factory.registerAffiliate(user, affiliate, { from: owner });

    // Owner registers profit for user via factory
    const profit = 500_000; // 0.5 USDC profit
    await factory.registerProfitFor(vault.address, user, profit, { from: owner });

    // Record balances before withdraw
    const balOwnerBefore = await usdc.balanceOf(owner);
    const balAffiliateBefore = await usdc.balanceOf(affiliate);
    const balUserBefore = await usdc.balanceOf(user);

    // User withdraws profit
    await vault.withdrawProfit({ from: user });

    // After: base fee = 1% for small profit, affiliateCut = 50% of fee
    const fee = Math.floor(profit * 1 / 100); // 1%
    const affiliateCut = Math.floor(fee * 5000 / 10000); // 50%
    const ownerFee = fee - affiliateCut;
    const payout = profit - fee;

    const balOwnerAfter = await usdc.balanceOf(owner);
    const balAffiliateAfter = await usdc.balanceOf(affiliate);
    const balUserAfter = await usdc.balanceOf(user);

    const ownerDelta = BigInt(balOwnerAfter.toString()) - BigInt(balOwnerBefore.toString());
    const affiliateDelta = BigInt(balAffiliateAfter.toString()) - BigInt(balAffiliateBefore.toString());
    const userDelta = BigInt(balUserAfter.toString()) - BigInt(balUserBefore.toString());

    assert.equal(ownerDelta.toString(), ownerFee.toString(), "owner should receive protocol fee minus affiliate cut");
    assert.equal(affiliateDelta.toString(), affiliateCut.toString(), "affiliate should receive affiliate cut");
    assert.equal(userDelta.toString(), payout.toString(), "user should receive payout excluding fee");
  });
});