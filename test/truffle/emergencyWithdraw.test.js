const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");

contract("Truffle: Emergency Withdraw", (accounts) => {
  it("owner can emergencyWithdraw when paused, TVLUpdated reflects decrease", async () => {
    const [owner, ledger, user] = accounts;
    const usdc = await USDCMock.new(10_000_000_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000);

    const txCreate = await factory.createVault(usdc.address, { from: owner });
    const evtCreate = txCreate.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(evtCreate.args.vault);

    // Create positive TVL via deposit
    await usdc.transfer(user, 1_000_000, { from: owner });
    await usdc.approve(vault.address, 1_000_000, { from: user });
    await vault.deposit(1_000_000, { from: user });

    // Pause via ledger
    await vault.pause({ from: ledger });

    const prevTvl = await vault.totalValueLocked();
    const ownerBalBefore = await usdc.balanceOf(owner);
    const txE = await vault.emergencyWithdraw(owner, 200_000, { from: owner });
    const tvlEvt = txE.logs.find((l) => l.event === "TVLUpdated");
    const ownerBalAfter = await usdc.balanceOf(owner);

    // Owner receives tokens
    const delta = BigInt(ownerBalAfter.toString()) - BigInt(ownerBalBefore.toString());
    assert.equal(delta.toString(), "200000");
    // TVL decreased accordingly
    assert.ok(tvlEvt, "TVLUpdated emitted on emergencyWithdraw");
    assert.equal(tvlEvt.args.previousTVL.toString(), prevTvl.toString());
    const expectedNew = BigInt(prevTvl.toString()) >= 200000n ? (BigInt(prevTvl.toString()) - 200000n).toString() : "0";
    assert.equal(tvlEvt.args.newTVL.toString(), expectedNew);
  });
});