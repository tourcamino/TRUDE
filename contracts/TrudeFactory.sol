// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title TRUDE Factory
 * @notice Deploys new vaults, manages affiliate registry and global parameters.
 * @author TRUDE
 * @dev UUPS Upgradeable, Pausable, Ownable (Ledger multisig compatible)
 */

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./TrudeVault.sol";
import "./TrudeAffiliate.sol";

// Minimal interface for the affiliate tracker to avoid symbol resolution issues
interface ITrudeAffiliate {
    function recordAffiliateEarning(address affiliate, uint256 amount) external;
}

contract TrudeFactory is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    /// @notice Ledger multisig for secondary authorization
    address public ledger;
    /// @notice Optional affiliate tracker contract (owned by protocol)
    address public affiliateTracker;

    /// @notice Minimum deposit (configurable)
    uint256 public minDeposit;
    /// @notice Affiliate fee share in basis points (e.g., 5000 = 50%)
    uint256 public affiliateShareBps;
    /// @notice Maximum dynamic fee percent cap
    uint256 public maxFeePercent;

    /// @notice Mapping user → affiliate
    mapping(address => address) public affiliateOf;
    /// @notice Authorized vaults created by this factory
    mapping(address => bool) public isVault;

    /// @notice Event emitted when vault is created
    /**
     * @notice Emitted when a new vault is created
     * @param vault The created vault address
     * @param creator The address that requested creation
     */
    event VaultCreated(address indexed vault, address indexed creator);

    /**
     * @notice Emitted when a user is registered with an affiliate
     * @param user The registered user
     * @param referrer The affiliate/referrer address
     */
    event AffiliateRegistered(address indexed user, address indexed referrer);

    /**
     * @notice Emitted when the ledger address is updated
     * @param newLedger The new ledger address
     */
    event LedgerUpdated(address newLedger);

    /**
     * @notice Emitted when minimum deposit is updated
     * @param newMin The new minimum deposit amount
     */
    event MinDepositUpdated(uint256 newMin);

    /**
     * @notice Emitted when affiliate share basis points are updated
     * @param newShareBps The new affiliate share in bps
     */
    event AffiliateShareUpdated(uint256 newShareBps);

    /**
     * @notice Emitted when max fee percent is updated
     * @param newMax The new max fee percent
     */
    event MaxFeeUpdated(uint256 newMax);

    modifier onlyLedger() {
        if (msg.sender != ledger) revert NotAuthorized();
        _;
    }

    /// @notice Initializer (replaces constructor)
    function initialize(address _owner, address _ledger, uint256 _minDeposit)
        public
        initializer
    {
        __Ownable_init();
        transferOwnership(_owner);
        __Pausable_init();
        __UUPSUpgradeable_init();

        if (_ledger == address(0)) revert ZeroLedger();
        if (_owner == address(0)) revert ZeroOwner();

        ledger = _ledger;
        minDeposit = _minDeposit;
        affiliateShareBps = 5000; // 50%
        maxFeePercent = 20; // 20%
    }

    /// @notice Authorize UUPS upgrades
    function _authorizeUpgrade(address) internal override onlyOwner {}

    // --- Factory Core ---

    function createVault(address _token) external whenNotPaused returns (address) {
        if (_token == address(0)) revert ZeroToken();
        TrudeVault vault = new TrudeVault();
        address own = owner();
        address led = ledger;
        vault.initialize(address(this), _token, own, led);
        isVault[address(vault)] = true;
        emit VaultCreated(address(vault), msg.sender);
        return address(vault);
    }

    // --- Affiliate registry ---

    function registerAffiliate(address user, address referrer) external whenNotPaused {
        if (user == address(0) || referrer == address(0)) revert ZeroAddress();
        if (affiliateOf[user] != address(0)) revert AlreadyRegistered();
        affiliateOf[user] = referrer;
        emit AffiliateRegistered(user, referrer);
    }

    // --- Admin functions ---

    function setLedger(address _newLedger) external onlyOwner {
        if (_newLedger == address(0)) revert ZeroAddress();
        ledger = _newLedger;
        emit LedgerUpdated(_newLedger);
    }

    /// @notice Set affiliate tracker contract address
    function setAffiliateTracker(address _tracker) external onlyOwner {
        if (_tracker == address(0)) revert ZeroAddress();
        affiliateTracker = _tracker;
    }

    function setMinDeposit(uint256 _newMin) external onlyOwner {
        minDeposit = _newMin;
        emit MinDepositUpdated(_newMin);
    }

    function setAffiliateShareBps(uint256 _newShareBps) external onlyOwner {
        if (_newShareBps > 10000) revert InvalidBps();
        affiliateShareBps = _newShareBps;
        emit AffiliateShareUpdated(_newShareBps);
    }

    function setMaxFeePercent(uint256 _newMax) external onlyOwner {
        if (_newMax > 100) revert InvalidPercent();
        maxFeePercent = _newMax;
        emit MaxFeeUpdated(_newMax);
    }

    function pause() external onlyLedger {
        _pause();
    }

    function unpause() external onlyLedger {
        _unpause();
    }

    /// @notice Record affiliate earning via tracker (callable only by authorized vaults)
    function recordAffiliateEarning(address affiliate, uint256 amount) external {
        if (!isVault[msg.sender]) revert NotVault();
        if (affiliateTracker != address(0)) {
            ITrudeAffiliate(affiliateTracker).recordAffiliateEarning(affiliate, amount);
        }
    }

    /// @notice Forward profit registration to a specific vault (owner-controlled)
    /// @dev Satisfies Vault's onlyFactory modifier by invoking as Factory
    function registerProfitFor(address vault, address user, uint256 profit)
        external
        onlyOwner
        whenNotPaused
    {
        if (!isVault[vault]) revert NotVault();
        TrudeVault(vault).registerProfit(user, profit);
    }

    // --- Custom errors ---
    error NotAuthorized();
    error ZeroLedger();
    error ZeroOwner();
    error ZeroToken();
    error ZeroAddress();
    error AlreadyRegistered();
    error InvalidBps();
    error InvalidPercent();
    error NotVault();
}
