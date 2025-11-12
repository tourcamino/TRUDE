const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: Affiliate Share BPS Boundary", (accounts) => {
  const [owner, ledger, user, affiliate] = accounts;

  it("affiliateShareBps = 0: no affiliate share, entire fee to protocol", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await factory.registerAffiliate(user, affiliate, { from: owner });
    await factory.setAffiliateShareBps(0, { from: owner });

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n); // fee base 1%
    const expectedFee = (profit * 1n) / 100n;
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    // Pre-fund to cover payout+fee
    await usdc.transfer(vault.address, profit.toString(), { from: owner });
    const affBalBefore = await usdc.balanceOf(affiliate);
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), expectedFee.toString());
    const affBalAfter = await usdc.balanceOf(affiliate);
    const diff = affBalAfter.sub(affBalBefore);
    assert.equal(diff.toString(), "0");
  });

  it("affiliateShareBps = 10000: entire fee to affiliate, event fee 0", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await factory.registerAffiliate(user, affiliate, { from: owner });
    await factory.setAffiliateShareBps(10000, { from: owner });

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n); // fee base 1%
    const expectedFeeBeforeAffiliate = (profit * 1n) / 100n;
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    // Pre-fund to cover payout+fee (fee goes to affiliate)
    await usdc.transfer(vault.address, profit.toString(), { from: owner });
    const affBalBefore = await usdc.balanceOf(affiliate);
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), "0");
    const affBalAfter = await usdc.balanceOf(affiliate);
    const diff = affBalAfter.sub(affBalBefore);
    assert.equal(diff.toString(), expectedFeeBeforeAffiliate.toString());
  });
});
