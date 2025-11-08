const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const TrudeAffiliate = artifacts.require("TrudeAffiliate");
const USDCMock = artifacts.require("USDCMock");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: Withdraw senza AffiliateTracker configurato", (accounts) => {
  const [owner, ledger, user, affiliate] = accounts;

  it("non emette AffiliatePaid se il tracker non è configurato", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);

    // Deployiamo un tracker ma NON lo configuriamo nella factory
    const tracker = await TrudeAffiliate.new();
    await tracker.initialize(factory.address, { from: owner });

    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await factory.registerAffiliate(user, affiliate, { from: owner });

    await usdc.transfer(user, 2_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 2_000_000_000_000_000n, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const profit = etherBI(1n);
    const expectedFee = (profit * 1n) / 100n;
    await factory.registerProfitFor(vault.address, user, profit.toString(), { from: owner });
    await usdc.transfer(vault.address, (profit + expectedFee).toString(), { from: owner });

    const txW = await vault.withdrawProfit({ from: user });
    const w = txW.logs.find((l) => l.event === "Withdraw");
    assert.ok(w, "Withdraw emesso");
    assert.equal(w.args.fee.toString(), expectedFee.toString());

    // Il tracker non è stato configurato nella factory → nessun evento AffiliatePaid
    const blk = txW.receipt.blockNumber;
    const paid = await tracker.getPastEvents("AffiliatePaid", { fromBlock: blk, toBlock: blk });
    assert.equal(paid.length, 0, "Nessun AffiliatePaid emesso dal tracker non configurato");
  });
});