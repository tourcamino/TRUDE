const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const TrudeAffiliate = artifacts.require("TrudeAffiliate");
const USDCMock = artifacts.require("USDCMock");

contract("Truffle: Affiliate Tracker Integration", (accounts) => {
  const [owner, ledger, user, affiliate] = accounts;

  it("invokes recordAffiliateEarning via Factory from Vault and emits AffiliatePaid", async () => {
    const usdc = await USDCMock.new(1_000_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);

    // Deploy affiliate tracker with owner = factory address
    const tracker = await TrudeAffiliate.new();
    await tracker.initialize(factory.address, { from: owner });
    await factory.setAffiliateTracker(tracker.address, { from: owner });

    // Create vault and set affiliate for user
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = vEvt.args.vault;
    const vault = await TrudeVault.at(vaultAddr);

    await factory.registerAffiliate(user, affiliate);

    // Funds and deposit
    await usdc.transfer(user, 200_000_000, { from: owner });
    await usdc.approve(vault.address, 200_000_000, { from: user });
    await vault.deposit(100_000_000, { from: user });

    // Register profit 10 USDC
    await factory.registerProfitFor(vault.address, user, 10_000_000, { from: owner });

    // Withdrawal: affiliate receives cut and the tracker records earning
    const txW = await vault.withdrawProfit({ from: user });
    const wBlock = txW.receipt.blockNumber;
    const paidEvents = await tracker.getPastEvents("AffiliatePaid", { fromBlock: wBlock, toBlock: wBlock });
    assert.ok(paidEvents.length >= 1, "AffiliatePaid event emitted");
    const evt = paidEvents[0];
    assert.equal(evt.returnValues.affiliate, affiliate);
    const earnings = await tracker.getAffiliateEarnings(affiliate);

    // Base fee 1% on 10 USDC => 0.1 USDC; affiliateShareBps default 50% => 0.05 USDC
    assert.equal(evt.returnValues.amount.toString(), "50000");
    assert.equal(earnings.toString(), "50000");
  });
});
