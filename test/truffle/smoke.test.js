const USDCMock = artifacts.require("USDCMock");
const TrudeFactory = artifacts.require("TrudeFactory");

contract("Truffle Smoke: deploys and creates vault", (accounts) => {
  it("deploys USDCMock and Factory, creates a Vault", async () => {
    const [owner, ledger] = accounts;

    const usdc = await USDCMock.new(100_000n * 10n ** 6n);
    const usdcAddr = await usdc.address;
    assert.match(usdcAddr, /^0x[0-9a-fA-F]{40}$/);

    const factory = await TrudeFactory.new();
    await factory.initialize(owner, ledger, 10_000_000);

    const tx = await factory.createVault(usdcAddr);
    const vaultCreated = tx.logs.find((l) => l.event === "VaultCreated");
    const vaultAddr = vaultCreated ? vaultCreated.args.vault : null;
    assert.match(vaultAddr, /^0x[0-9a-fA-F]{40}$/);
  });
});