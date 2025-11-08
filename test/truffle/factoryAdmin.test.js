const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");

contract("Truffle: Factory Admin & Pause", (accounts) => {
  it("sets admin params and enforces pause/unpause by ledger", async () => {
    const [owner, ledger] = accounts;
    const usdc = await USDCMock.new(100_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000);

    // Owner can update minDeposit
    await factory.setMinDeposit(50_000, { from: owner });
    const min = await factory.minDeposit();
    assert.equal(min.toString(), "50000");

    // Ledger can pause; createVault should revert while paused
    await factory.pause({ from: ledger });
    let createReverted = false;
    try {
      await factory.createVault(usdc.address, { from: owner });
    } catch (e) {
      createReverted = true;
    }
    assert.equal(createReverted, true, "createVault must revert when paused");

    // Unpause restores functionality
    await factory.unpause({ from: ledger });
    const tx = await factory.createVault(usdc.address, { from: owner });
    const evt = tx.logs.find((l) => l.event === "VaultCreated");
    assert.ok(evt, "VaultCreated should be emitted after unpause");
  });
});