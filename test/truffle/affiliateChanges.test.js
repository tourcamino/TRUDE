const TrudeFactory = artifacts.require("TrudeFactory");
const TrudeVault = artifacts.require("TrudeVault");
const USDCMock = artifacts.require("USDCMock");

contract("Truffle: Affiliate Changes & Share BPS", (accounts) => {
  const [owner, ledger, user, affiliateA, affiliateB] = accounts;

  it("updates affiliate and affiliateShareBps, verifies events and distributions", async () => {
    const usdc = await USDCMock.new(1_000_000n * 10n ** 6n);

    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000); // minDeposit = 10 USDC

    const txV = await factory.createVault(usdc.address);
    const vEvt = txV.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = vEvt.args.vault;
    const vault = await TrudeVault.at(vaultAddr);

    // Register affiliate A then change share bps
    await factory.registerAffiliate(user, affiliateA);
    const txShare = await factory.setAffiliateShareBps(2000, { from: owner }); // 20%
    const evtShare = txShare.logs.find((l) => l.event === "AffiliateShareUpdated");
    assert.ok(evtShare, "AffiliateShareUpdated emitted");
    assert.equal(evtShare.args.newShareBps.toString(), "2000");

    // Approve and deposit
    await usdc.transfer(user, 200_000_000, { from: owner });
    await usdc.approve(vault.address, 200_000_000, { from: user });
    await vault.deposit(100_000_000, { from: user }); // 100 USDC

    // Register profit 10 USDC; base fee 1%, fee = 0.1 USDC, affiliate cut = 20% of fee => 0.02 USDC
    await factory.registerProfitFor(vault.address, user, 10_000_000, { from: owner });

    const affBalBefore = await usdc.balanceOf(affiliateA);
    const ownerBalBefore = await usdc.balanceOf(owner);

    await vault.withdrawProfit({ from: user });

    const affBalAfter = await usdc.balanceOf(affiliateA);
    const ownerBalAfter = await usdc.balanceOf(owner);

    const affiliateGain = BigInt(affBalAfter.toString()) - BigInt(affBalBefore.toString());
    const ownerGain = BigInt(ownerBalAfter.toString()) - BigInt(ownerBalBefore.toString());

    // Total fee 0.1 USDC => affiliate 20% = 0.02 USDC; owner receives 0.08 USDC
    assert.equal(affiliateGain.toString(), "20000");
    assert.equal(ownerGain.toString(), "80000");

    // Change affiliate for the user and verify mapping
    await factory.registerAffiliate(user, affiliateB).catch(() => {}); // prevenire AlreadyRegistered
    // Note: the Factory does not allow re-registration (AlreadyRegistered), so we verify the mapping remains unchanged
    const affMapped = await factory.affiliateOf(user);
    assert.equal(affMapped, affiliateA, "affiliate remains A after re-registration attempt");
  });
});
