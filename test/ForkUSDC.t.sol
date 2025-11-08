// Foundry fork test using forge-std to validate mainnet state
// Requires: `forge install foundry-rs/forge-std` and FOUNDRY_ETH_RPC_URL
pragma solidity ^0.8.25;

import "forge-std/Test.sol";

interface IERC20Minimal {
    function decimals() external view returns (uint8);
}

contract ForkUSDC is Test {
    function testUSDCDecimalsOnMainnet() public {
        string memory rpc = vm.envString("FOUNDRY_ETH_RPC_URL");
        // Pin to a recent block for deterministic behavior; adjust as needed
        vm.createSelectFork(rpc);

        IERC20Minimal usdc = IERC20Minimal(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        assertEq(usdc.decimals(), 6, "USDC mainnet decimals should be 6");
    }
}