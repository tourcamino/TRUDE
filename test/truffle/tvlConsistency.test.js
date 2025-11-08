const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

contract("Truffle: TVL Consistency Sequence", (accounts) => {
  const [owner, ledger, user] = accounts;

  it("deposit → profit → withdraw → emergencyWithdraw mantiene coerenza di TVL ed eventi", async () => {
    const usdc = await USDCMock.new(1_000_000n * 10n ** 6n);
    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);
    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = vEvt.args.vault;
    const vault = await TrudeVault.at(vaultAddr);

    await usdc.transfer(user, 300_000_000, { from: owner });
    await usdc.approve(vault.address, 300_000_000, { from: user });

    // Deposit
    const txD = await vault.deposit(100_000_000, { from: user });
    const dBlock = txD.receipt.blockNumber;
    const dTVLEvents = await vault.getPastEvents("TVLUpdated", { fromBlock: dBlock, toBlock: dBlock });
    assert.ok(dTVLEvents.length >= 1);
    const prev0 = dTVLEvents[0].returnValues.previousTVL;
    const new0 = dTVLEvents[0].returnValues.newTVL;
    assert.equal(prev0.toString(), "0");
    assert.equal(new0.toString(), "100000000");

    // Profit
    const txP = await factory.registerProfitFor(vault.address, user, 50_000_000, { from: owner });
    const pBlock = txP.receipt.blockNumber;
    const pTVLEvents = await vault.getPastEvents("TVLUpdated", { fromBlock: pBlock, toBlock: pBlock });
    const prev1 = pTVLEvents[0].returnValues.previousTVL;
    const new1 = pTVLEvents[0].returnValues.newTVL;
    assert.equal(prev1.toString(), "100000000");
    assert.equal(new1.toString(), "150000000");

    // Withdraw profit
    const txW = await vault.withdrawProfit({ from: user });
    const wBlock = txW.receipt.blockNumber;
    const wTVLEvents = await vault.getPastEvents("TVLUpdated", { fromBlock: wBlock, toBlock: wBlock });
    const prev2 = wTVLEvents[0].returnValues.previousTVL;
    const new2 = wTVLEvents[0].returnValues.newTVL;
    assert.equal(prev2.toString(), "150000000");
    assert.equal(new2.toString(), "100000000");

    // Pause + Emergency withdraw 10 USDC to owner
    await vault.pause({ from: owner });
    const txE = await vault.emergencyWithdraw(owner, 10_000_000, { from: owner });
    const eBlock = txE.receipt.blockNumber;
    const eTVLEvents = await vault.getPastEvents("TVLUpdated", { fromBlock: eBlock, toBlock: eBlock });
    const prev3 = eTVLEvents[0].returnValues.previousTVL;
    const new3 = eTVLEvents[0].returnValues.newTVL;
    assert.equal(prev3.toString(), "100000000");
    assert.equal(new3.toString(), "90000000");
  });
});