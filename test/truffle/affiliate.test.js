const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");

contract("Truffle: Affiliate", (accounts) => {
  it("registers affiliate and prevents duplicate", async () => {
    const [owner, ledger, user, affiliate] = accounts;

    const usdc = await USDCMock.new(100_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000); // minDeposit = 0.01 USDC

    // First registration succeeds
    await factory.registerAffiliate(user, affiliate, { from: owner });
    const stored = await factory.affiliateOf(user);
    assert.equal(stored, affiliate, "affiliateOf should be set");

    // Second registration reverts
    let reverted = false;
    try {
      await factory.registerAffiliate(user, affiliate, { from: owner });
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "duplicate registration must revert");
  });
});