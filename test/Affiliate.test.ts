import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TRUDE: Affiliate contract permissions and events", function () {
  it("restricts recording to owner and emits AffiliatePaid", async function () {
    const [owner, other] = await ethers.getSigners();

    const TrudeAffiliate = await ethers.getContractFactory("TrudeAffiliate");
    const affiliate = (await TrudeAffiliate.deploy()) as any;
    await affiliate.waitForDeployment();
    await (await affiliate.initialize(await owner.getAddress())).wait();

    // Non-owner cannot record earning
    await expect(affiliate.connect(other).recordAffiliateEarning(await other.getAddress(), 1_000_000)).to.be.reverted;

    // Owner records earning and event is emitted
    await expect(affiliate.connect(owner).recordAffiliateEarning(await other.getAddress(), 1_000_000))
      .to.emit(affiliate, "AffiliatePaid")
      .withArgs(await other.getAddress(), 1_000_000);

    // Totals should reflect the recorded earning
    const total = await affiliate.getAffiliateEarnings(await other.getAddress());
    expect(total).to.equal(1_000_000);
  });
});