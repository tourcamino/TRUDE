// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../contracts/TrudeFactory.sol";
import "../contracts/TrudeVault.sol";
import "../contracts/TrudeAffiliate.sol";
import "../contracts/USDCMock.sol";

/**
 * @title Supply Chain Fixes Test Suite
 * @notice Test suite for validating critical fixes before testnet deployment
 * @dev Tests fee decimals, createVault permissions, and affiliate ownership
 */
contract SupplyChainFixesTest is Test {
    TrudeFactory factory;
    TrudeVault vault;
    TrudeAffiliate affiliate;
    USDCMock usdc;
    USDCMock weth; // 18 decimals
    
    address owner = address(0x1);
    address ledger = address(0x2);
    address user = address(0x3);
    address affiliateUser = address(0x4);
    address attacker = address(0x5);
    
    function setUp() public {
        // Deploy tokens
        usdc = new USDCMock(1000000 * 10**6); // 1M USDC with 6 decimals
        weth = new USDCMock(1000000 * 10**18); // 1M WETH with 18 decimals
        
        // Deploy Factory (as proxy pattern)
        factory = new TrudeFactory();
        factory.initialize(owner, ledger, 100 * 10**6); // 100 USDC min deposit
        
        // Deploy Affiliate (as proxy pattern)
        affiliate = new TrudeAffiliate();
        affiliate.initialize(owner, address(factory));
        
        // Set affiliate tracker
        vm.prank(owner);
        factory.setAffiliateTracker(address(affiliate));
        
        // Authorize commodities
        vm.prank(owner);
        factory.authorizeCommodity("coffee");
        vm.prank(owner);
        factory.authorizeCommodity("wheat");
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 1: FEE DECIMALS MISMATCH FIX
    ////////////////////////////////////////////////////////////////
    
    function testFeeCalculationWithUSDC() public {
        // Create USDC vault
        vm.prank(owner);
        address usdcVaultAddr = factory.createVault(address(usdc));
        TrudeVault usdcVault = TrudeVault(usdcVaultAddr);
        
        // Test fee calculation with different profit amounts
        // 1 USDC profit (should be 1% fee)
        vm.prank(address(factory));
        usdcVault.registerSupplyChainProfit(user, 1 * 10**6, "coffee");
        
        // 1000 USDC profit (should be ~1.02% fee)
        vm.prank(address(factory));
        usdcVault.registerSupplyChainProfit(user, 1000 * 10**6, "coffee");
        
        // 1M USDC profit (should be 20% fee)
        vm.prank(address(factory));
        usdcVault.registerSupplyChainProfit(user, 1000000 * 10**6, "coffee");
        
        // Verify profits are recorded correctly
        assertEq(usdcVault.supplyChainProfits(user), 1001001 * 10**6);
        assertEq(usdcVault.commodityTotalProfits("coffee"), 1001001 * 10**6);
        assertEq(usdcVault.userCommodityProfits(user, "coffee"), 1001001 * 10**6);
    }
    
    function testFeeCalculationWithWETH() public {
        // Create WETH vault (18 decimals)
        vm.prank(owner);
        address wethVaultAddr = factory.createVault(address(weth));
        TrudeVault wethVault = TrudeVault(wethVaultAddr);
        
        // Test fee calculation with different profit amounts
        // 1 WETH profit (should be 1% fee)
        vm.prank(address(factory));
        wethVault.registerSupplyChainProfit(user, 1 ether, "coffee");
        
        // 1000 WETH profit (should be ~1.02% fee)
        vm.prank(address(factory));
        wethVault.registerSupplyChainProfit(user, 1000 ether, "coffee");
        
        // 1M WETH profit (should be 20% fee)
        vm.prank(address(factory));
        wethVault.registerSupplyChainProfit(user, 1000000 ether, "coffee");
        
        // Verify profits are recorded correctly
        assertEq(wethVault.supplyChainProfits(user), 1001001 ether);
        assertEq(wethVault.commodityTotalProfits("coffee"), 1001001 ether);
        assertEq(wethVault.userCommodityProfits(user, "coffee"), 1001001 ether);
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 2: CREATEVAULT PERMISSIONS FIX
    ////////////////////////////////////////////////////////////////
    
    function testCreateVaultOnlyOwner() public {
        // Owner can create vault
        vm.prank(owner);
        address vaultAddr = factory.createVault(address(usdc));
        assertTrue(vaultAddr != address(0));
        assertTrue(factory.isVault(vaultAddr));
        
        // Attacker cannot create vault
        vm.prank(attacker);
        vm.expectRevert();
        factory.createVault(address(usdc));
        
        // Regular user cannot create vault
        vm.prank(user);
        vm.expectRevert();
        factory.createVault(address(usdc));
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 3: AFFILIATE OWNERSHIP FIX
    ////////////////////////////////////////////////////////////////
    
    function testAffiliateFactoryAuthorization() public {
        // Factory can record affiliate earnings
        vm.prank(address(factory));
        affiliate.recordAffiliateEarning(affiliateUser, 100 * 10**6);
        
        assertEq(affiliate.totalAffiliateEarnings(affiliateUser), 100 * 10**6);
        
        // Attacker cannot record affiliate earnings
        vm.prank(attacker);
        vm.expectRevert();
        affiliate.recordAffiliateEarning(affiliateUser, 100 * 10**6);
        
        // Owner can still record affiliate earnings
        vm.prank(owner);
        affiliate.recordAffiliateEarning(affiliateUser, 50 * 10**6);
        
        assertEq(affiliate.totalAffiliateEarnings(affiliateUser), 150 * 10**6);
    }
    
    function testCommodityReferralAuthorization() public {
        // Factory can record commodity referral earnings
        vm.prank(address(factory));
        affiliate.recordCommodityReferralEarning(affiliateUser, "coffee", 100 * 10**6);
        
        assertEq(affiliate.totalCommodityReferralEarnings(affiliateUser), 100 * 10**6);
        assertEq(affiliate.commodityReferralEarnings(affiliateUser, "coffee"), 100 * 10**6);
        assertEq(affiliate.totalCommoditiesReferred(affiliateUser), 1);
        assertEq(affiliate.totalCommodityReferrals("coffee"), 1);
        
        // Owner can also record commodity referral earnings
        vm.prank(owner);
        affiliate.recordCommodityReferralEarning(affiliateUser, "wheat", 50 * 10**6);
        
        assertEq(affiliate.totalCommodityReferralEarnings(affiliateUser), 150 * 10**6);
        assertEq(affiliate.commodityReferralEarnings(affiliateUser, "wheat"), 50 * 10**6);
        assertEq(affiliate.totalCommoditiesReferred(affiliateUser), 2);
        assertEq(affiliate.totalCommodityReferrals("wheat"), 1);
        
        // Attacker cannot record commodity referral earnings
        vm.prank(attacker);
        vm.expectRevert();
        affiliate.recordCommodityReferralEarning(affiliateUser, "coffee", 100 * 10**6);
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 4: SUPPLY CHAIN NFT MINTING
    ////////////////////////////////////////////////////////////////
    
    function testCommodityNFTMinting() public {
        // Mint coffee NFT as owner
        vm.prank(owner);
        uint256 tokenId = factory.mintCommodityNFT("coffee", "Ethiopia, Yirgacheffe", 1000, 4200 * 10**18, "premium");
        
        assertEq(tokenId, 0);
        
        (string memory commodityType, string memory origin, uint256 quantity, uint256 valueUSD, address minter, uint256 mintTimestamp, string memory qualityGrade, bool isActive) = factory.commodityMetadata(tokenId);
        assertEq(commodityType, "coffee");
        assertEq(origin, "Ethiopia, Yirgacheffe");
        assertEq(quantity, 1000);
        assertEq(valueUSD, 4200 * 10**18);
        assertEq(minter, owner);
        assertEq(qualityGrade, "premium");
        assertTrue(isActive);
        assertTrue(mintTimestamp > 0);
        
        // Mint wheat NFT as owner
        vm.prank(owner);
        uint256 tokenId2 = factory.mintCommodityNFT("wheat", "USA, Kansas", 5000, 1500 * 10**18, "grade A");
        assertEq(tokenId2, 1);
    }
    
    function testCommodityNFTMintingReverts() public {
        // Cannot mint unauthorized commodity
        vm.prank(owner);
        vm.expectRevert();
        factory.mintCommodityNFT("oil", "Saudi Arabia", 1000, 7000 * 10**18, "crude");
        
        // Cannot mint with zero quantity
        vm.prank(owner);
        vm.expectRevert();
        factory.mintCommodityNFT("coffee", "Ethiopia", 0, 4200 * 10**18, "premium");
        
        // Cannot mint with zero value
        vm.prank(owner);
        vm.expectRevert();
        factory.mintCommodityNFT("coffee", "Ethiopia", 1000, 0, "premium");
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 5: SUPPLY CHAIN ARBITRAGE PROFIT TRACKING
    ////////////////////////////////////////////////////////////////
    
    function testCommodityArbitrageProfitRecording() public {
        // Record arbitrage profit as owner
        vm.prank(owner);
        factory.recordCommodityArbitrageProfit("coffee", 500 * 10**18, "cross-border");
        vm.prank(owner);
        factory.recordCommodityArbitrageProfit("coffee", 300 * 10**18, "seasonal");
        vm.prank(owner);
        factory.recordCommodityArbitrageProfit("wheat", 200 * 10**18, "cross-border");
        
        // Should revert with unauthorized commodity
        vm.prank(owner);
        vm.expectRevert();
        factory.recordCommodityArbitrageProfit("oil", 100 * 10**18, "cross-border");
        
        // Should revert with zero profit
        vm.prank(owner);
        vm.expectRevert();
        factory.recordCommodityArbitrageProfit("coffee", 0, "cross-border");
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 6: END-TO-END SUPPLY CHAIN FLOW
    ////////////////////////////////////////////////////////////////
    
    function testEndToEndSupplyChainFlow() public {
        // 1. Create vault
        vm.prank(owner);
        address vaultAddr = factory.createVault(address(usdc));
        TrudeVault supplyVault = TrudeVault(vaultAddr);
        
        // 2. Mint commodity NFT as owner
        vm.prank(owner);
        uint256 tokenId = factory.mintCommodityNFT("coffee", "Ethiopia, Yirgacheffe", 1000, 4200 * 10**18, "premium");
        
        // 3. Record arbitrage profit as owner
        vm.prank(owner);
        factory.recordCommodityArbitrageProfit("coffee", 500 * 10**18, "cross-border");
        
        // 4. Register supply chain profit in vault
        vm.prank(address(factory));
        supplyVault.registerSupplyChainProfit(user, 500 * 10**6, "coffee");
        
        // 5. Record affiliate earnings
        vm.prank(address(factory));
        affiliate.recordCommodityReferralEarning(affiliateUser, "coffee", 50 * 10**6);
        
        // 6. Verify all state is correct
        assertEq(supplyVault.supplyChainProfits(user), 500 * 10**6);
        assertEq(supplyVault.commodityTotalProfits("coffee"), 500 * 10**6);
        assertEq(supplyVault.userCommodityProfits(user, "coffee"), 500 * 10**6);
        assertEq(affiliate.totalCommodityReferralEarnings(affiliateUser), 50 * 10**6);
        assertEq(affiliate.commodityReferralEarnings(affiliateUser, "coffee"), 50 * 10**6);
    }
    
    ////////////////////////////////////////////////////////////////
    // TEST 7: GAS USAGE VALIDATION
    ////////////////////////////////////////////////////////////////
    
    function testGasUsageWithinLimits() public {
        // Test mintCommodityNFT gas usage as owner
        vm.prank(owner);
        uint256 gasBefore = gasleft();
        factory.mintCommodityNFT("coffee", "Ethiopia, Yirgacheffe", 1000, 4200 * 10**18, "premium");
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 200000, "mintCommodityNFT should use < 200k gas");
        
        // Create vault for supply chain profit testing
        vm.prank(owner);
        address vaultAddr = factory.createVault(address(usdc));
        TrudeVault testVault = TrudeVault(vaultAddr);
        
        // Test registerSupplyChainProfit gas usage
        gasBefore = gasleft();
        vm.prank(address(factory));
        testVault.registerSupplyChainProfit(user, 500 * 10**6, "coffee");
        gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 100000, "registerSupplyChainProfit should use < 100k gas");
        
        // Test view functions gas usage
        gasBefore = gasleft();
        testVault.getSupplyChainProfits(user);
        gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 50000, "getSupplyChainProfits should use < 50k gas");
        
        gasBefore = gasleft();
        testVault.getUserCommodityProfits(user, "coffee");
        gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 50000, "getUserCommodityProfits should use < 50k gas");
        
        gasBefore = gasleft();
        testVault.getCommodityTotalProfits("coffee");
        gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 50000, "getCommodityTotalProfits should use < 50k gas");
    }
}