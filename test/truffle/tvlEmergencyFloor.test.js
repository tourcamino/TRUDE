const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

contract("Truffle: TVL Emergency Floor", (accounts) => {
  const [owner, ledger, user] = accounts;

  it("emergencyWithdraw maggiore di TVL porta TVL a 0 e emette TVLUpdated coerente", async () => {
    const usdc = await USDCMock.new(1_000_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(vEvt.args.vault);

    await usdc.transfer(user, 200_000_000, { from: owner });
    await usdc.approve(vault.address, 200_000_000, { from: user });
    await vault.deposit(100_000_000, { from: user });

    const tvlBefore = await vault.totalValueLocked();
    assert.equal(tvlBefore.toString(), "100000000");

    await vault.pause({ from: owner });
    // Pre-fondiamo il vault oltre il TVL per permettere il transfer
    await usdc.transfer(vault.address, 250_000_000, { from: owner });
    const txE = await vault.emergencyWithdraw(owner, 300_000_000, { from: owner });
    const eBlock = txE.receipt.blockNumber;
    const tvlEvents = await vault.getPastEvents("TVLUpdated", { fromBlock: eBlock, toBlock: eBlock });
    assert.ok(tvlEvents.length >= 1);
    const prev = tvlEvents[0].returnValues.previousTVL;
    const next = tvlEvents[0].returnValues.newTVL;
    assert.equal(prev.toString(), "100000000");
    assert.equal(next.toString(), "0");
  });
});