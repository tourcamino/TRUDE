const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");

contract("Truffle: Event Payloads", (accounts) => {
  it("validates Deposit, ProfitRegistered, Withdraw, TVLUpdated payloads", async () => {
    const [owner, ledger, user] = accounts;
    const usdc = await USDCMock.new(1_000_000_000_000_000n); // large supply
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 100_000); // 0.1 USDC

    const txCreate = await factory.createVault(usdc.address, { from: owner });
    const evtCreate = txCreate.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = evtCreate.args.vault;
    const vault = await TrudeVault.at(vaultAddr);

    // Deposit emits Deposit + TVLUpdated(prev,new)
    await usdc.transfer(user, 500_000, { from: owner });
    await usdc.approve(vault.address, 500_000, { from: user });
    const prevTvl0 = await vault.totalValueLocked();
    const txDep = await vault.deposit(200_000, { from: user });
    const depEvt = txDep.logs.find((l) => l.event === "Deposit");
    const tvlEvtDep = txDep.logs.find((l) => l.event === "TVLUpdated");
    assert.ok(depEvt, "Deposit event emitted");
    assert.equal(depEvt.args.user, user);
    assert.equal(depEvt.args.amount.toString(), "200000");
    assert.ok(tvlEvtDep, "TVLUpdated event after deposit");
    assert.equal(tvlEvtDep.args.previousTVL.toString(), prevTvl0.toString());
    assert.equal(tvlEvtDep.args.newTVL.toString(), (BigInt(prevTvl0.toString()) + 200000n).toString());

    // ProfitRegistered via factory + TVLUpdated(prev,new)
    const prevTvl1 = await vault.totalValueLocked();
    const profit = 150_000; // 0.15 USDC
    const txProfit = await factory.registerProfitFor(vault.address, user, profit, { from: owner });
    const block = txProfit.receipt.blockNumber;
    const profitEvents = await vault.getPastEvents("ProfitRegistered", { fromBlock: block, toBlock: block });
    const tvlEvents = await vault.getPastEvents("TVLUpdated", { fromBlock: block, toBlock: block });
    assert.ok(profitEvents.length >= 1, "ProfitRegistered event emitted");
    const profitEvt = profitEvents[0];
    assert.equal(profitEvt.returnValues.user, user);
    assert.equal(profitEvt.returnValues.profit.toString(), profit.toString());
    assert.ok(tvlEvents.length >= 1, "TVLUpdated after ProfitRegistered");
    const tvlEvtProfit = tvlEvents[0];
    assert.equal(tvlEvtProfit.returnValues.previousTVL.toString(), prevTvl1.toString());
    assert.equal(tvlEvtProfit.returnValues.newTVL.toString(), (BigInt(prevTvl1.toString()) + BigInt(profit)).toString());

    // Withdraw emits Withdraw(user, payout, fee) + TVLUpdated(prev,new)
    // Top up vault to pay out profit + fee
    const feeRate = 1; // small profit => 1%
    const fee = Math.floor((profit * feeRate) / 100);
    await usdc.transfer(vault.address, profit + fee, { from: owner });

    const prevTvl2 = await vault.totalValueLocked();
    const txW = await vault.withdrawProfit({ from: user });
    const wEvt = txW.logs.find((l) => l.event === "Withdraw");
    const tvlEvtW = txW.logs.find((l) => l.event === "TVLUpdated");
    assert.ok(wEvt, "Withdraw event emitted");
    assert.equal(wEvt.args.user, user);
    assert.equal(wEvt.args.amount.toString(), (profit - fee).toString());
    assert.equal(wEvt.args.fee.toString(), fee.toString());
    assert.ok(tvlEvtW, "TVLUpdated after withdraw");
    assert.equal(tvlEvtW.args.previousTVL.toString(), prevTvl2.toString());
    assert.equal(tvlEvtW.args.newTVL.toString(), (BigInt(prevTvl2.toString()) - BigInt(profit)).toString());
  });
});