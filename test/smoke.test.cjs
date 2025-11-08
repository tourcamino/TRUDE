const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("Smoke: deploys and creates vault", function () {
  it("deploys USDCMock and Factory, creates a Vault", async function () {
    const [owner, ledger] = await ethers.getSigners();

    const USDCMock = await ethers.getContractFactory("USDCMock");
    const usdc = await USDCMock.deploy(100_000n * 10n ** 6n);
    await usdc.waitForDeployment();
    const usdcAddr = await usdc.getAddress();
    expect(usdcAddr).to.match(/^0x[0-9a-fA-F]{40}$/);

    const TrudeFactory = await ethers.getContractFactory("TrudeFactory");
    const factory = await TrudeFactory.deploy();
    await factory.waitForDeployment();
    await (await factory.initialize(await owner.getAddress(), await ledger.getAddress(), 10_000_000)).wait();

    const tx = await factory.createVault(usdcAddr);
    const rc = await tx.wait();
    const created = rc.logs.find((l) => l.fragment && l.fragment.name === "VaultCreated");
    const vaultAddr = created ? created.args[0] : null;
    expect(vaultAddr).to.match(/^0x[0-9a-fA-F]{40}$/);
  });
});