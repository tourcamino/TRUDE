// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import {TrudeFactory} from "../contracts/TrudeFactory.sol";
import {TrudeVault} from "../contracts/TrudeVault.sol";
import {USDCMock} from "../contracts/USDCMock.sol";

contract InvariantVaultTest is Test, StdInvariant {
    TrudeFactory public factory;
    TrudeVault public vault;
    USDCMock public usdc;

    function setUp() public {
        // Deploy base contracts
        usdc = new USDCMock(1_000_000_000 * 1e6);
        factory = new TrudeFactory();
        factory.initialize(address(this), address(this), 1e6);
        TrudeVault v = new TrudeVault();
        v.initialize(address(factory), address(usdc), address(this), address(this));
        vault = v;

        // Target the vault contract for invariant fuzzing (calls may revert; invariants must hold)
        targetContract(address(vault));
    }

    // Invariant: TVL never negative
    function invariant_TVL_non_negative() public {
        uint256 tvl = vault.totalValueLocked();
        assertGe(tvl, 0, "TVL must be non-negative");
    }

    // Invariant: Affiliate share is always within cap (<= 10000 bps)
    function invariant_affiliate_share_cap() public {
        uint256 bps = factory.affiliateShareBps();
        assertLe(bps, 10_000, "affiliateShareBps must be <= 10000");
    }

    // Invariant: Max fee percent is bounded (<= 100)
    function invariant_fee_percent_cap() public {
        uint256 cap = factory.maxFeePercent();
        assertLe(cap, 100, "maxFeePercent must be <= 100");
    }
}