const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: No Affiliate → Fee Entirely to Protocol", (accounts) => {
  const [owner, ledger, user, someone] = accounts;

  it("without affiliate, the entire fee goes to the protocol (owner)", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    // Do not register any affiliate for the user

    await usdc.transfer(user, 1_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 1_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n); // fee base 1%
    const expectedFee = (profit * 1n) / 100n;
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    // Pre-fund to cover payout+fee
    await usdc.transfer(vault.address, profit.toString(), { from: owner });
    const ownerBalBefore = await usdc.balanceOf(owner);
    const someoneBalBefore = await usdc.balanceOf(someone);
    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.equal(w.args.fee.toString(), expectedFee.toString());
    const ownerBalAfter = await usdc.balanceOf(owner);
    const someoneBalAfter = await usdc.balanceOf(someone);
    // Entire fee to protocol
    const ownerDiff = ownerBalAfter.sub(ownerBalBefore);
    assert.equal(ownerDiff.toString(), expectedFee.toString());
    // No third-party payment
    const someoneDiff = someoneBalAfter.sub(someoneBalBefore);
    assert.equal(someoneDiff.toString(), "0");
  });
});
