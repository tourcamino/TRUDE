const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");

contract("Truffle: Vault Deposit Edge Cases", (accounts) => {
  it("reverts below minDeposit and succeeds at threshold", async () => {
    const [owner, ledger, user] = accounts;
    const usdc = await USDCMock.new(1_000_000_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000); // 0.1 USDC

    const tx = await factory.createVault(usdc.address, { from: owner });
    const evt = tx.logs.find((l) => l.event === "VaultCreated");
    const vault = await TrudeVault.at(evt.args.vault);

    await usdc.transfer(user, 500_000, { from: owner });

    // Below threshold should revert
    await usdc.approve(vault.address, 50_000, { from: user });
    let reverted = false;
    try {
      await vault.deposit(50_000, { from: user });
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "deposit below minDeposit must revert");

    // At threshold should succeed
    await usdc.approve(vault.address, 100_000, { from: user });
    await vault.deposit(100_000, { from: user });
    const tvl = await vault.totalValueLocked();
    assert.equal(tvl.toString(), "100000", "vault should record deposit at threshold in TVL");
  });
});