// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title TRUDE Affiliate Tracker
 * @notice Keeps lifetime earnings for affiliates.
 * @author TRUDE
 */

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Interface for factory to get factory address
interface ITrudeFactory {
    function factory() external view returns (address);
}

contract TrudeAffiliate is Initializable, OwnableUpgradeable {
    address public factory; // FIX: Store factory address for authorization
    mapping(address => uint256) public totalAffiliateEarnings;
    
    // --- Supply Chain Extensions ---
    mapping(address => uint256) public totalCommodityReferralEarnings;
    mapping(address => mapping(string => uint256)) public commodityReferralEarnings;
    mapping(string => uint256) public totalCommodityReferrals;
    mapping(address => uint256) public totalCommoditiesReferred;

    /**
     * @notice Emitted when an affiliate is credited earnings
     * @param affiliate The affiliate account
     * @param amount The amount recorded for the affiliate
     */
    event AffiliatePaid(address indexed affiliate, uint256 amount);

    /**
     * @notice Emitted when commodity referral earnings are recorded
     * @param affiliate The affiliate account
     * @param commodityType The commodity type (e.g., "coffee", "wheat")
     * @param amount The amount recorded for the commodity referral
     */
    event CommodityReferralPaid(address indexed affiliate, string commodityType, uint256 amount);

    // --- Custom errors ---
    error ZeroAffiliate();
    error ZeroAmount();
    error ZeroFactory();
    error NotFactory();
    error NotAuthorized();

    /**
     * @notice Initializes the affiliate tracker
     * @param _owner The owner address to set
     * @param _factory The factory address for authorization
     */
    function initialize(address _owner, address _factory) public initializer {
        __Ownable_init();
        transferOwnership(_owner);
        if (_factory == address(0)) revert ZeroFactory();
        factory = _factory;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert NotFactory();
        _;
    }

    /**
     * @notice Record earnings for an affiliate (callable by owner OR factory)
     * @param affiliate The affiliate account
     * @param amount The amount to record
     */
    function recordAffiliateEarning(address affiliate, uint256 amount)
        external
    {
        // FIX: Allow both owner and factory to call
        if (msg.sender != owner() && msg.sender != factory) revert NotAuthorized();
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

    /**
     * @notice Record earnings for a commodity referral (callable by owner OR factory)
     * @param affiliate The affiliate account
     * @param commodityType The commodity type (e.g., "coffee", "wheat")
     * @param amount The amount to record for commodity referral
     */
    function recordCommodityReferralEarning(
        address affiliate, 
        string memory commodityType, 
        uint256 amount
    ) external {
        // FIX: Allow both owner and factory to call
        if (msg.sender != owner() && msg.sender != factory) revert NotAuthorized();
        if (affiliate == address(0)) revert ZeroAffiliate();
        if (amount == 0) revert ZeroAmount();

        totalCommodityReferralEarnings[affiliate] += amount;
        commodityReferralEarnings[affiliate][commodityType] += amount;
        totalCommodityReferrals[commodityType] += 1;
        totalCommoditiesReferred[affiliate] += 1;
        
        // Also record as regular affiliate earning
        totalAffiliateEarnings[affiliate] += amount;
        
        emit CommodityReferralPaid(affiliate, commodityType, amount);
        emit AffiliatePaid(affiliate, amount);
    }

    /**
     * @notice Get total commodity referral earnings for an affiliate
     * @param affiliate The affiliate account
     * @return Total commodity referral earnings
     */
    function getCommodityReferralEarnings(address affiliate) 
        external 
        view 
        returns (uint256) 
    {
        return totalCommodityReferralEarnings[affiliate];
    }

    /**
     * @notice Get commodity referral earnings by type for an affiliate
     * @param affiliate The affiliate account
     * @param commodityType The commodity type
     * @return Earnings for that specific commodity type
     */
    function getAffiliateCommodityEarnings(address affiliate, string memory commodityType) 
        external 
        view 
        returns (uint256) 
    {
        return commodityReferralEarnings[affiliate][commodityType];
    }

    /**
     * @notice Get total number of commodities referred by an affiliate
     * @param affiliate The affiliate account
     * @return Total number of commodities referred
     */
    function getTotalCommoditiesReferred(address affiliate) 
        external 
        view 
        returns (uint256) 
    {
        return totalCommoditiesReferred[affiliate];
    }

    /**
     * @notice Get total referrals for a commodity type across all affiliates
     * @param commodityType The commodity type
     * @return Total number of referrals for that commodity
     */
    function getTotalCommodityReferrals(string memory commodityType) 
        external 
        view 
        returns (uint256) 
    {
        return totalCommodityReferrals[commodityType];
    }
}

