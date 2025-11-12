const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: Max Fee Percent Boundary", (accounts) => {
  const [owner, ledger, user] = accounts;

  it("cap at 0%: no fee, full payout to the user", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await factory.setMaxFeePercent(0, { from: owner });

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n); // fee base 1%
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    // Pre-fund to cover payout = profit (0 fee)
    await usdc.transfer(vault.address, profit.toString(), { from: owner });
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), "0");
    assert.equal(w.args.amount.toString(), profit.toString());
  });

  it("cap at 100%: does not alter base fee (1%), payout equals 99%", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await factory.setMaxFeePercent(100, { from: owner });

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n); // base 1%, cap at 100% does not alter the base
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    // Pre-fund to cover payout+fee
    await usdc.transfer(vault.address, profit.toString(), { from: owner });
    const ownerBalanceBefore = await usdc.balanceOf(owner);
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    const expectedFee = (profit * 1n) / 100n;
    const expectedAmount = profit - expectedFee;
    assert.equal(w.args.fee.toString(), expectedFee.toString());
    assert.equal(w.args.amount.toString(), expectedAmount.toString());
    const ownerBalanceAfter = await usdc.balanceOf(owner);
    const diff = ownerBalanceAfter.sub(ownerBalanceBefore);
    assert.equal(diff.toString(), expectedFee.toString());
  });
});
