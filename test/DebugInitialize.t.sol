// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../contracts/TrudeFactory.sol";
import "../contracts/TrudeAffiliate.sol";

contract DebugInitialize is Test {
    TrudeFactory factory;
    TrudeAffiliate affiliate;
    
    address owner = address(0x1);
    address ledger = address(0x2);
    
    function testInitializeDebug() public {
        // Deploy Factory
        factory = new TrudeFactory();
        console.log("Factory deployed at:", address(factory));
        
        // Try to initialize
        factory.initialize(owner, ledger, 100 * 10**6);
        console.log("Factory initialized");
        
        // Deploy Affiliate
        affiliate = new TrudeAffiliate();
        console.log("Affiliate deployed at:", address(affiliate));
        
        // Try to initialize affiliate
        affiliate.initialize(owner, address(factory));
        console.log("Affiliate initialized");
        
        // Check if factory is set correctly
        console.log("Factory in affiliate:", affiliate.factory());
        console.log("Expected factory:", address(factory));
        
        assertEq(affiliate.factory(), address(factory));
    }
}