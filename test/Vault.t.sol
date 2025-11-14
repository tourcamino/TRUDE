// Minimal Foundry test without forge-std
// Validates Factory can create a Vault for USDCMock
pragma solidity ^0.8.25;

import "../contracts/USDCMock.sol";
import "../contracts/TrudeFactory.sol";
import "../contracts/TrudeAffiliate.sol";

contract VaultTest {
    function testCreateVault() public {
        USDCMock usdc = new USDCMock(1_000_000 * 10**6);

        TrudeFactory factory = new TrudeFactory();
        factory.initialize(address(this), address(this), 10_000_000);

        TrudeAffiliate affiliate = new TrudeAffiliate();
        affiliate.initialize(address(this), address(factory));
        factory.setAffiliateTracker(address(affiliate));

        address vaultAddr = factory.createVault(address(usdc));
        require(vaultAddr != address(0), "vault not created");
    }
}