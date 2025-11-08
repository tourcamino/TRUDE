// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title TRUDE Affiliate Tracker
 * @notice Keeps lifetime earnings for affiliates.
 * @author TRUDE
 */

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TrudeAffiliate is Initializable, OwnableUpgradeable {
    mapping(address => uint256) public totalAffiliateEarnings;

    /**
     * @notice Emitted when an affiliate is credited earnings
     * @param affiliate The affiliate account
     * @param amount The amount recorded for the affiliate
     */
    event AffiliatePaid(address indexed affiliate, uint256 amount);

    // --- Custom errors ---
    error ZeroAffiliate();
    error ZeroAmount();

    /**
     * @notice Initializes the affiliate tracker
     * @param _owner The owner address to set
     */
    function initialize(address _owner) public initializer {
        __Ownable_init();
        transferOwnership(_owner);
    }

    /**
     * @notice Record earnings for an affiliate
     * @param affiliate The affiliate account
     * @param amount The amount to record
     */
    function recordAffiliateEarning(address affiliate, uint256 amount)
        external
        onlyOwner
    {
        if (affiliate == address(0)) revert ZeroAffiliate();
        if (amount == 0) revert ZeroAmount();
        totalAffiliateEarnings[affiliate] += amount;
        emit AffiliatePaid(affiliate, amount);
    }

    /**
     * @notice Get total earnings for an affiliate
     * @param affiliate The affiliate account
     * @return The total recorded earnings
     */
    function getAffiliateEarnings(address affiliate)
        external
        view
        returns (uint256)
    {
        return totalAffiliateEarnings[affiliate];
    }
}

