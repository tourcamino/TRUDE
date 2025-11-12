const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: Fee Boundary Conditions", (accounts) => {
  const [owner, ledger, user] = accounts;

  it("fee al confine di 1 ether: 1 ether - 1 wei e 1 ether + 1 wei", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    // profit = 1 ether - 1 wei
    const p1 = etherBI(1n) - 1n;
    await factory.registerProfitFor(vault.address, user, p1.toString(), { from: owner });
    const fee1 = (p1 * 1n) / 100n; // 1%
    // Pre-fund vault so transfer succeeds
    await usdc.transfer(vault.address, (p1 + fee1).toString(), { from: owner });
    const tx1 = await vault.withdrawProfit({ from: user });
    const w1 = tx1.logs.find((l) => l.event === "Withdraw");
    assert.equal(w1.args.fee.toString(), fee1.toString());

    // profit = 1 ether + 1 wei
    const p2 = etherBI(1n) + 1n;
    await factory.registerProfitFor(vault.address, user, p2.toString(), { from: owner });
    const feeRate2 = 1n + (p2 * 19n) / etherBI(1_000_000n);
    const fee2 = (p2 * feeRate2) / 100n;
    // Pre-fund vault for second withdrawal
    await usdc.transfer(vault.address, (p2 + fee2).toString(), { from: owner });
    let tx2 = await vault.withdrawProfit({ from: user });
    let w2 = tx2.logs.find((l) => l.event === "Withdraw");
    assert.equal(w2.args.fee.toString(), fee2.toString());
  });

  it("fee al confine di 1,000,000 ether: -1 wei e +1 wei", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(1_000_000n * 10n ** 6n, { from: user });

    const near = etherBI(1_000_000n);
    // profit = 1,000,000 ether - 1 wei => deve usare formula intermedia
    const p3 = near - 1n;
    await factory.registerProfitFor(vault.address, user, p3.toString(), { from: owner });
    const feeRate3 = 1n + (p3 * 19n) / near;
    const fee3 = (p3 * feeRate3) / 100n;
    await usdc.transfer(vault.address, (p3 + fee3).toString(), { from: owner });
    let tx3 = await vault.withdrawProfit({ from: user });
    let w3 = tx3.logs.find((l) => l.event === "Withdraw");
    assert.equal(w3.args.fee.toString(), fee3.toString());

    // profit = 1,000,000 ether + 1 wei => cap at 20%
    const p4 = near + 1n;
    await factory.registerProfitFor(vault.address, user, p4.toString(), { from: owner });
    const fee4 = (p4 * 20n) / 100n;
    await usdc.transfer(vault.address, (p4 + fee4).toString(), { from: owner });
    let tx4 = await vault.withdrawProfit({ from: user });
    let w4 = tx4.logs.find((l) => l.event === "Withdraw");
    assert.equal(w4.args.fee.toString(), fee4.toString());
  });
});
