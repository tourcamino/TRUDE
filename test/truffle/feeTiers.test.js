const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");

function ether(n) {
  return BigInt(n) * 10n ** 18n;
}

contract("Truffle: Fee Tiers", (accounts) => {
  it("applies fee tiers for small, intermediate, and high profits", async () => {
    const [owner, ledger, user] = accounts;
    const usdc = await USDCMock.new(10_000_000_000_000_000_000_000_000n); // huge supply
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000); // 0.1 USDC

    const txCreate = await factory.createVault(usdc.address, { from: owner });
    const evtCreate = txCreate.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(evtCreate.args.vault);

    // Case A: profit <= 1 ether → feeRate = 1%
    const profitA = ether(1n); // BigInt
    await factory.registerProfitFor(vault.address, user, web3.utils.toBN(profitA.toString()), { from: owner });
    const feeA = (profitA * 1n) / 100n;
    await usdc.transfer(vault.address, (profitA + feeA).toString(), { from: owner });
    let txA = await vault.withdrawProfit({ from: user });
    let wEvtA = txA.logs.find((l) => l.event === "Withdraw");
    assert.equal(wEvtA.args.amount.toString(), (profitA - feeA).toString());
    assert.equal(wEvtA.args.fee.toString(), feeA.toString());

    // Case B: intermediate profit (100_000 ether) → feeRate = 1 + (profit*19/1e6 ether)
    const profitB = ether(100_000n);
    await factory.registerProfitFor(vault.address, user, web3.utils.toBN(profitB.toString()), { from: owner });
    const feeRateB = 1n + (profitB * 19n) / ether(1_000_000n);
    const feeB = (profitB * feeRateB) / 100n;
    await usdc.transfer(vault.address, (profitB + feeB).toString(), { from: owner });
    let txB = await vault.withdrawProfit({ from: user });
    let wEvtB = txB.logs.find((l) => l.event === "Withdraw");
    assert.equal(wEvtB.args.fee.toString(), feeB.toString());

    // Case C: profit >= 1,000,000 ether → feeRate = 20% (cap)
    const profitC = ether(1_000_000n);
    await factory.registerProfitFor(vault.address, user, web3.utils.toBN(profitC.toString()), { from: owner });
    const feeC = (profitC * 20n) / 100n;
    await usdc.transfer(vault.address, (profitC + feeC).toString(), { from: owner });
    let txC = await vault.withdrawProfit({ from: user });
    let wEvtC = txC.logs.find((l) => l.event === "Withdraw");
    assert.equal(wEvtC.args.fee.toString(), feeC.toString());
  });
});