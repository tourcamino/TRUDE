const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

contract("Truffle: Multi-user profits & TVL consistency", (accounts) => {
  const [owner, ledger, userA, userB] = accounts;

  it("mantiene profitti separati e aggiorna TVL correttamente", async () => {
    const usdc = await USDCMock.new(2_000_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);

    const vaultTx = await factory.createVault(usdc.address);
    const vEvt = vaultTx.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = vEvt.args.vault;
    const vault = await TrudeVault.at(vaultAddr);

    // Fondi e approvazioni
    await usdc.transfer(userA, 500_000_000, { from: owner });
    await usdc.transfer(userB, 500_000_000, { from: owner });
    await usdc.approve(vault.address, 500_000_000, { from: userA });
    await usdc.approve(vault.address, 500_000_000, { from: userB });

    await vault.deposit(200_000_000, { from: userA }); // 200 USDC
    await vault.deposit(100_000_000, { from: userB }); // 100 USDC

    const tvlAfterDeposits = await vault.totalValueLocked();
    assert.equal(tvlAfterDeposits.toString(), (200_000_000 + 100_000_000).toString());

    // Profitti separati
    await factory.registerProfitFor(vault.address, userA, 30_000_000, { from: owner }); // 30 USDC
    await factory.registerProfitFor(vault.address, userB, 10_000_000, { from: owner }); // 10 USDC

    const profitA = await vault.profits(userA);
    const profitB = await vault.profits(userB);
    assert.equal(profitA.toString(), "30000000");
    assert.equal(profitB.toString(), "10000000");

    const tvlAfterProfits = await vault.totalValueLocked();
    assert.equal(tvlAfterProfits.toString(), (200_000_000 + 100_000_000 + 30_000_000 + 10_000_000).toString());

    // UserA ritira; TVL si riduce del suo profitto (30 USDC)
    await vault.withdrawProfit({ from: userA });
    const profitAAfter = await vault.profits(userA);
    assert.equal(profitAAfter.toString(), "0");

    const tvlAfterAWithdraw = await vault.totalValueLocked();
    assert.equal(tvlAfterAWithdraw.toString(), (200_000_000 + 100_000_000 + 30_000_000 + 10_000_000 - 30_000_000).toString());

    // UserB ancora intatto, ritira ora
    await vault.withdrawProfit({ from: userB });
    const profitBAfter = await vault.profits(userB);
    assert.equal(profitBAfter.toString(), "0");

    const tvlFinal = await vault.totalValueLocked();
    assert.equal(tvlFinal.toString(), (200_000_000 + 100_000_000 + 30_000_000 + 10_000_000 - 30_000_000 - 10_000_000).toString());
  });
});