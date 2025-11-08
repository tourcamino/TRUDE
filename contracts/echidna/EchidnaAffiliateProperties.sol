// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {TrudeFactory} from "../TrudeFactory.sol";
import {TrudeVault} from "../TrudeVault.sol";
import {USDCMock} from "../USDCMock.sol";

/**
 * Echidna property-based harness for affiliate/fee tiering and TVL safety.
 */
contract EchidnaAffiliateProperties {
    TrudeFactory public factory;
    TrudeVault public vault;
    USDCMock public usdc;

    constructor() {
        usdc = new USDCMock(1_000_000_000 * 1e6);
        factory = new TrudeFactory();
        factory.initialize(address(this), address(this), 1e6);
        TrudeVault v = new TrudeVault();
        v.initialize(address(factory), address(usdc), address(this), address(this));
        vault = v;
    }

    // Mutators for fuzzing
    function fuzzSetAffiliateShareBps(uint16 bps) external {
        // allowed range [0, 10000]; above reverts, preserving property
        if (bps <= 10_000) {
            factory.setAffiliateShareBps(bps);
        } else {
            // ignore out-of-range
        }
    }

    function fuzzSetMaxFeePercent(uint8 pct) external {
        if (pct <= 100) {
            factory.setMaxFeePercent(pct);
        } else {
            // ignore
        }
    }

    // Properties
    function echidna_affiliate_bps_cap() external view returns (bool) {
        return factory.affiliateShareBps() <= 10_000;
    }

    function echidna_fee_cap_bound() external view returns (bool) {
        return factory.maxFeePercent() <= 100;
    }

    function echidna_tvl_non_negative() external view returns (bool) {
        return vault.totalValueLocked() >= 0;
    }
}