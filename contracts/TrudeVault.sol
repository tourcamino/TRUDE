// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title TRUDE Vault
 * @notice Non-custodial profit vault with dynamic performance fees and affiliate payouts.
 * @dev Upgradeable, Pausable, ReentrancyGuard, controlled by Factory.
 */

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { TrudeFactory } from "./TrudeFactory.sol";

contract TrudeVault is
    Initializable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    using SafeERC20 for IERC20;
    address public factory;
    address public token;
    address public ledger;
    uint256 public totalValueLocked;
    uint8 public tokenDecimals; // FIX: Store token decimals for fee calculation

    mapping(address => uint256) public balances;
    mapping(address => uint256) public profits;
    
    // --- Supply Chain Extensions ---
    mapping(address => uint256) public supplyChainProfits;
    mapping(string => uint256) public commodityTotalProfits;
    mapping(address => mapping(string => uint256)) public userCommodityProfits;
    
    // Nuova struttura per tracciare performance utente
    struct UserPerformance {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 profitRealized;
        uint256 lastFeePayment;
        uint256 entryTime;
    }
    
    mapping(address => UserPerformance) public userPerformances;
    
    // Parametri fee dinamiche 10-30%
    uint256 public constant BASE_FEE_TIER_1 = 1000; // 10% - Profitti 0-0.5%
    uint256 public constant BASE_FEE_TIER_2 = 1500; // 15% - Profitti 0.5-1%
    uint256 public constant BASE_FEE_TIER_3 = 2000; // 20% - Profitti 1-2%
    uint256 public constant BASE_FEE_TIER_4 = 2500; // 25% - Profitti 2-3%
    uint256 public constant BASE_FEE_TIER_5 = 3000; // 30% - Profitti >3%
    
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant PROFIT_THRESHOLD_1 = 500; // 0.5%
    uint256 public constant PROFIT_THRESHOLD_2 = 1000; // 1%
    uint256 public constant PROFIT_THRESHOLD_3 = 2000; // 2%
    uint256 public constant PROFIT_THRESHOLD_4 = 3000; // 3%

    /**
     * @notice Emitted when a user deposits tokens into the vault
     * @param user The depositor address
     * @param amount The deposited amount
     */
    event Deposit(address indexed user, uint256 amount);
    /**
     * @notice Emitted when profit is registered for a user
     * @param user The beneficiary address
     * @param profit The profit amount registered
     */
    event ProfitRegistered(address indexed user, uint256 profit);
    /**
     * @notice Emitted when a user withdraws profit from the vault
     * @param user The withdrawing user
     * @param amount The amount paid out to the user
     * @param fee The fee collected by the protocol
     */
    event Withdraw(address indexed user, uint256 amount, uint256 fee);
    /**
     * @notice Emitted when a user withdraws capital (principal) from the vault
     * @param user The withdrawing user
     * @param amount The principal amount returned to the user
     */
    event CapitalWithdraw(address indexed user, uint256 amount, uint256 fee);
    /**
     * @notice Emitted when TVL is updated
     * @param previousTVL The previous total value locked
     * @param newTVL The new total value locked
     */
    event TVLUpdated(uint256 previousTVL, uint256 newTVL);

    modifier onlyFactory() {
        if (msg.sender != factory) revert NotFactory();
        _;
    }

    function initialize(
        address _factory,
        address _token,
        address _owner,
        address _ledger
    ) public initializer {
        __Ownable_init();
        transferOwnership(_owner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        if (_factory == address(0) || _ledger == address(0)) revert ZeroAddress();
        if (_token == address(0)) revert ZeroToken();
        factory = _factory;
        token = _token;
        ledger = _ledger;
        
        // FIX: Read token decimals for proper fee calculation
        tokenDecimals = IERC20Metadata(_token).decimals();
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    // --- Core logic ---

    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        TrudeFactory f = TrudeFactory(factory);
        if (amount < f.minDeposit()) revert BelowMin();

        IERC20 t = IERC20(token);
        t.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        
        // Aggiorna performance tracking
        UserPerformance storage user = userPerformances[msg.sender];
        user.totalDeposited += amount;
        if (user.entryTime == 0) {
            user.entryTime = block.timestamp;
        }
        uint256 prev = totalValueLocked;
        totalValueLocked = prev + amount;

        emit Deposit(msg.sender, amount);
        emit TVLUpdated(prev, totalValueLocked);
    }

    function registerProfit(address user, uint256 profit) external onlyFactory {
        profits[user] += profit;
        
        // Aggiorna performance tracking
        UserPerformance storage userPerf = userPerformances[user];
        userPerf.profitRealized += profit;
        uint256 prev = totalValueLocked;
        totalValueLocked = prev + profit;
        emit ProfitRegistered(user, profit);
        emit TVLUpdated(prev, totalValueLocked);
    }

    function withdrawProfit() external whenNotPaused nonReentrant {
        uint256 profit = profits[msg.sender];
        if (profit == 0) revert NoProfit();

        // Checks-effects: clear state before external interactions
        profits[msg.sender] = 0;
        
        // Aggiorna performance tracking
        UserPerformance storage user = userPerformances[msg.sender];
        user.lastFeePayment = block.timestamp;

        TrudeFactory f = TrudeFactory(factory);
        IERC20 t = IERC20(token);
        uint256 feeRate = _calculateDynamicFee(profit, f);
        uint256 fee = (profit * feeRate) / FEE_DENOMINATOR;
        uint256 payout = profit - fee;

        // Fee distribution
        address affiliate = f.affiliateOf(msg.sender);
        if (affiliate != address(0)) {
            uint256 bps = f.affiliateShareBps();
            uint256 affiliateCut = (fee * bps) / 10000;
            t.safeTransfer(affiliate, affiliateCut);
            // Record affiliate earning via Factory (authorized route)
            // Ignored if affiliate tracker is not configured
            try f.recordAffiliateEarning(affiliate, affiliateCut) {} catch {}
            fee -= affiliateCut;
        }
        // No fee transfer needed - fee is 0
        // No fee to transfer - fee is 0
        t.safeTransfer(msg.sender, payout);

        // Update TVL: profit was withdrawn from the vault
        uint256 prev = totalValueLocked;
        totalValueLocked = prev - profit;

        emit Withdraw(msg.sender, payout, fee);
        emit TVLUpdated(prev, totalValueLocked);
    }

    /**
     * @notice Withdraws previously deposited capital (principal) with 0% fee
     * @dev Always available, even when the vault is paused; non-reentrant
     * @param amount The amount of principal to withdraw
     */
    function withdrawCapital(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 bal = balances[msg.sender];
        if (bal < amount) revert InsufficientBalance();

        // Effects before interactions
        balances[msg.sender] = bal - amount;
        
        // Aggiorna performance tracking
        UserPerformance storage user = userPerformances[msg.sender];
        user.totalWithdrawn += amount;

        // Zero withdrawal fee - full amount transferred
        uint256 fee = 0; // No withdrawal fee
        uint256 payout = amount - fee;

        // Transfer fee to owner and payout to user
        IERC20 t = IERC20(token);
        address ownerAddr = owner();
        if (fee > 0) {
            t.safeTransfer(ownerAddr, fee);
        }
        t.safeTransfer(msg.sender, payout);

        // Update TVL to reflect capital leaving the vault
        uint256 prev = totalValueLocked;
        totalValueLocked = prev - amount;

        emit CapitalWithdraw(msg.sender, amount, fee);
        emit TVLUpdated(prev, totalValueLocked);
    }

    function _calculateDynamicFee(uint256 profit, TrudeFactory f)
        internal
        view
        returns (uint256)
    {
        uint256 base;
        // FIX: Scale thresholds based on token decimals
        uint256 threshold1 = 10 ** tokenDecimals; // 1 token unit
        uint256 thresholdMax = 1000000 * (10 ** tokenDecimals); // 1M token units
        
        if (profit <= threshold1) {
            base = 1; // 1%
        } else if (profit >= thresholdMax) {
            base = 20; // 20%
        } else {
            base = 1 + ((profit * 19) / thresholdMax);
        }
        uint256 cap = f.maxFeePercent();
        if (base > cap) return cap;
        return base;
    }

    // --- Admin ---

    function pause() external {
        if (msg.sender != owner() && msg.sender != ledger) revert NotAuthorized();
        _pause();
    }

    function unpause() external {
        if (msg.sender != owner() && msg.sender != ledger) revert NotAuthorized();
        _unpause();
    }

    // --- Emergency ---

    function emergencyWithdraw(address to, uint256 amount) external whenPaused onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        IERC20(token).safeTransfer(to, amount);
        // Update TVL to reflect assets leaving the vault in emergency
        uint256 prev = totalValueLocked;
        totalValueLocked = prev >= amount ? (prev - amount) : 0;
        emit TVLUpdated(prev, totalValueLocked);
    }

    /**
     * @notice Returns the current token balance held by this vault
     * @dev Utility to aid accounting, testing, and monitoring
     */
    function totalAssets() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    // --- Supply Chain Functions ---

    /**
     * @notice Register supply chain arbitrage profit for commodity trading
     * @param user The user who generated the profit
     * @param profit The profit amount in token units
     * @param commodityType The commodity type (e.g., "coffee", "wheat")
     */
    function registerSupplyChainProfit(
        address user, 
        uint256 profit, 
        string memory commodityType
    ) external onlyFactory {
        if (profit == 0) revert ZeroProfit();
        if (user == address(0)) revert ZeroAddress();

        supplyChainProfits[user] += profit;
        commodityTotalProfits[commodityType] += profit;
        userCommodityProfits[user][commodityType] += profit;
        
        // Also register as regular profit for fee calculation
        profits[user] += profit;
        
        // Update TVL
        uint256 prev = totalValueLocked;
        totalValueLocked = prev + profit;
        
        emit ProfitRegistered(user, profit);
        emit TVLUpdated(prev, totalValueLocked);
    }

    /**
     * @notice Get total supply chain profits for a user
     * @param user The user address
     * @return Total supply chain profits
     */
    function getSupplyChainProfits(address user) external view returns (uint256) {
        return supplyChainProfits[user];
    }

    /**
     * @notice Get profits by commodity type for a user
     * @param user The user address
     * @param commodityType The commodity type
     * @return Profits for that specific commodity
     */
    function getUserCommodityProfits(address user, string memory commodityType) 
        external 
        view 
        returns (uint256) 
    {
        return userCommodityProfits[user][commodityType];
    }

    /**
     * @notice Get total profits across all users for a commodity type
     * @param commodityType The commodity type
     * @return Total profits for that commodity
     */
    function getCommodityTotalProfits(string memory commodityType) 
        external 
        view 
        returns (uint256) 
    {
        return commodityTotalProfits[commodityType];
    }

    // --- Custom errors ---
    error NotFactory();
    error ZeroAddress();
    error ZeroToken();
    error ZeroAmount();
    error BelowMin();
    error NoProfit();
    error NotAuthorized();
    error InsufficientBalance();
    error ZeroProfit();
}
