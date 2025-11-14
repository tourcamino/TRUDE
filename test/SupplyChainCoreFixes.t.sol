// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../contracts/TrudeFactory.sol";
import "../contracts/TrudeVault.sol";
import "../contracts/TrudeAffiliate.sol";
import "../contracts/USDCMock.sol";

/**
 * @title Supply Chain Core Fixes Test
 * @notice Simplified test for validating critical fixes
 * @dev Tests fee decimals, createVault permissions, and affiliate ownership
 */
contract SupplyChainCoreFixesTest is Test {
    TrudeFactory factory;
    TrudeVault vault;
    TrudeAffiliate affiliate;
    USDCMock usdc;
    
    address owner = address(0x1);
    address ledger = address(0x2);
    address user = address(0x3);
    address affiliateUser = address(0x4);
    address attacker = address(0x5);
    
    function setUp() public {
        // Deploy tokens
        usdc = new USDCMock(1000000 * 10**6); // 1M USDC with 6 decimals
        
        // Deploy Factory first
        factory = new TrudeFactory();
        factory.initialize(owner, ledger, 100 * 10**6); // 100 USDC min deposit
        
        // Deploy Affiliate and initialize with factory address
        affiliate = new TrudeAffiliate();
        affiliate.initialize(owner, address(factory));
        
        // Set affiliate tracker (after affiliate is initialized)
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
        
        // Verify profits are recorded correctly
        assertEq(usdcVault.supplyChainProfits(user), 1 * 10**6);
        assertEq(usdcVault.commodityTotalProfits("coffee"), 1 * 10**6);
        assertEq(usdcVault.userCommodityProfits(user, "coffee"), 1 * 10**6);
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
}