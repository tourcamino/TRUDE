const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: Max Fee Percent Scaling & Cap", (accounts) => {
  const [owner, ledger, user] = accounts;

  it("small profit: 1% fee under 5% cap → no clamp", async () => {
    const usdc = await USDCMock.new((10_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000); // 0.1 USDC
    await factory.setMaxFeePercent(5, { from: owner }); // cap 5%
    const txCreate = await factory.createVault(usdc.address);
    const vault = await TrudeVault.at(txCreate.logs.find((l) => l.event === "VaultCreated").args.vault);

    await usdc.transfer(user, 2_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 2_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n); // feeRate base 1%
    const fee = (profit * 1n) / 100n;
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    await usdc.transfer(vault.address, (profit + fee).toString(), { from: owner });
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), fee.toString());
    assert.equal(w.args.amount.toString(), (profit - fee).toString());
  });

  it("medium profit: base ~2.9% → clamp to 2%", async () => {
    const usdc = await USDCMock.new((10_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000);
    await factory.setMaxFeePercent(2, { from: owner }); // cap 2%
    const txCreate = await factory.createVault(usdc.address);
    const vault = await TrudeVault.at(txCreate.logs.find((l) => l.event === "VaultCreated").args.vault);

    await usdc.transfer(user, 2_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 2_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(100_000n);
    const baseRate = 1n + (profit * 19n) / etherBI(1_000_000n); // ≈ 2.9%
    assert.ok(baseRate > 2n, "baseRate must exceed cap to clamp");
    const fee = (profit * 2n) / 100n; // clamp to 2%
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    await usdc.transfer(vault.address, (profit + fee).toString(), { from: owner });
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), fee.toString());
    assert.equal(w.args.amount.toString(), (profit - fee).toString());
  });

  it("very large profit: base 20% → clamp to 10%", async () => {
    const usdc = await USDCMock.new((10_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000);
    await factory.setMaxFeePercent(10, { from: owner }); // cap 10%
    const txCreate = await factory.createVault(usdc.address);
    const vault = await TrudeVault.at(txCreate.logs.find((l) => l.event === "VaultCreated").args.vault);

    await usdc.transfer(user, 2_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 2_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(2_000_000n);
    const fee = (profit * 10n) / 100n; // clamp to 10%
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    await usdc.transfer(vault.address, (profit + fee).toString(), { from: owner });
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), fee.toString());
    assert.equal(w.args.amount.toString(), (profit - fee).toString());
  });
});
