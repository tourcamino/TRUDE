const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const TrudeAffiliate = artifacts.require("TrudeAffiliate");
const USDCMock = artifacts.require("USDCMock");

function etherBI(n) { return BigInt(n) * 10n ** 18n; }

contract("Truffle: Affiliate Tracker Multi-Affiliate & Multi-Withdraw", (accounts) => {
  const [owner, ledger, userA, userB, affA, affB] = accounts;

  it("registra earnings per più affiliate su più withdraw", async () => {
    const usdc = await USDCMock.new((5_000_000_000_000_000_000_000_000_000_000n).toString());
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);

    const tracker = await TrudeAffiliate.new();
    await tracker.initialize(factory.address, { from: owner });
    await factory.setAffiliateTracker(tracker.address, { from: owner });

    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    // Registra affiliate distinti per userA e userB
    await factory.registerAffiliate(userA, affA, { from: owner });
    await factory.registerAffiliate(userB, affB, { from: owner });

    // Depositi
    await usdc.transfer(userA, 2_000_000_000_000_000n, { from: owner });
    await usdc.transfer(userB, 2_000_000_000_000_000n, { from: owner });
    await usdc.approve(vault.address, 2_000_000_000_000_000n, { from: userA });
    await usdc.approve(vault.address, 2_000_000_000_000_000n, { from: userB });
    await vault.deposit(200_000_000, { from: userA });
    await vault.deposit(200_000_000, { from: userB });

    // Profitti e pre-funding per entrambi
    const profitA = etherBI(1n); // 1 ether equiv
    const feeA = (profitA * 1n) / 100n; // 1%
    const profitB = etherBI(2n); // 2 ether
    const feeBBaseRate = 1n + (profitB * 19n) / etherBI(1_000_000n); // formula dinamica
    const feeB = (profitB * feeBBaseRate) / 100n;
    await factory.registerProfitFor(vault.address, userA, profitA.toString(), { from: owner });
    await factory.registerProfitFor(vault.address, userB, profitB.toString(), { from: owner });
    await usdc.transfer(vault.address, (profitA + feeA + profitB + feeB).toString(), { from: owner });

    // Withdraw A e B
    const txWA = await vault.withdrawProfit({ from: userA });
    const txWB = await vault.withdrawProfit({ from: userB });

    // Recupera eventi AffiliatePaid esattamente nei blocchi di interesse
    const blkA = txWA.receipt.blockNumber;
    const blkB = txWB.receipt.blockNumber;
    const evtsA = await tracker.getPastEvents("AffiliatePaid", { fromBlock: blkA, toBlock: blkA });
    const evtsB = await tracker.getPastEvents("AffiliatePaid", { fromBlock: blkB, toBlock: blkB });
    assert.ok(evtsA.length >= 1, "AffiliatePaid per A");
    assert.ok(evtsB.length >= 1, "AffiliatePaid per B");

    // BPS predefinito 50% → cut affiliate = fee * 50%
    const cutA = (feeA * 5000n) / 10000n;
    const cutB = (feeB * 5000n) / 10000n;
    assert.equal(evtsA[0].returnValues.affiliate, affA);
    assert.equal(evtsA[0].returnValues.amount.toString(), cutA.toString());
    assert.equal(evtsB[0].returnValues.affiliate, affB);
    assert.equal(evtsB[0].returnValues.amount.toString(), cutB.toString());
  });
});