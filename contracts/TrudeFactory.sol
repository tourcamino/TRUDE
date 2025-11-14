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

// Supply Chain Extensions
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


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

    // --- Supply Chain Extensions ---
    /// @notice Counter for commodity NFT token IDs
    uint256 private _commodityTokenIdCounter;
    /// @notice Mapping commodity type → NFT contract address
    mapping(string => address) public commodityNFTContracts;
    /// @notice Mapping commodity NFT token ID → commodity metadata
    mapping(uint256 => CommodityMetadata) public commodityMetadata;
    /// @notice Authorized commodity types
    mapping(string => bool) public authorizedCommodities;

    struct CommodityMetadata {
        string commodityType;      // "coffee", "wheat", "gold"
        string origin;             // "Ethiopia, Yirgacheffe"
        uint256 quantity;          // in base units
        uint256 valueUSD;          // value in USD * 10^18
        address minter;            // who minted the NFT
        uint256 mintTimestamp;     // when it was minted
        string qualityGrade;       // "premium", "grade A", etc.
        bool isActive;             // if commodity is still valid
    }

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

    /**
     * @notice Emitted when a commodity NFT is minted
     * @param tokenId The NFT token ID
     * @param commodityType The type of commodity
     * @param origin The origin location
     * @param minter Who minted the NFT
     */
    event CommodityNFTMinted(uint256 indexed tokenId, string commodityType, string origin, address indexed minter);

    /**
     * @notice Emitted when a commodity type is authorized
     * @param commodityType The commodity type being authorized
     */
    event CommodityAuthorized(string commodityType);

    /**
     * @notice Emitted when commodity arbitrage profit is recorded
     * @param commodityType The commodity type
     * @param profitUSD The profit in USD
     * @param arbitrageType The type of arbitrage performed
     */
    event CommodityArbitrageProfit(string commodityType, uint256 profitUSD, string arbitrageType);

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

    function createVault(address _token) external whenNotPaused onlyOwner returns (address) {
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
        if (user == referrer) revert SelfReferral();
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
        // Affiliate tracker should be initialized separately before setting
    }

    function setMinDeposit(uint256 _newMin) external onlyOwner {
        minDeposit = _newMin;
        emit MinDepositUpdated(_newMin);
    }

    function setAffiliateShareBps(uint256) external onlyOwner {
        revert AffiliateShareFrozen();
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

    // --- Supply Chain Functions ---

    /**
     * @notice Authorize a new commodity type for NFT minting
     * @param commodityType The commodity type (e.g., "coffee", "wheat")
     */
    function authorizeCommodity(string memory commodityType) external onlyOwner {
        authorizedCommodities[commodityType] = true;
        emit CommodityAuthorized(commodityType);
    }

    /**
     * @notice Mint commodity NFT with supply chain metadata
     * @param commodityType Type of commodity (must be authorized)
     * @param origin Origin location (e.g., "Ethiopia, Yirgacheffe")
     * @param quantity Quantity in base units
     * @param valueUSD Value in USD * 10^18
     * @param qualityGrade Quality grade (e.g., "premium", "grade A")
     */
    function mintCommodityNFT(
        string memory commodityType,
        string memory origin,
        uint256 quantity,
        uint256 valueUSD,
        string memory qualityGrade
    ) external whenNotPaused returns (uint256) {
        if (!authorizedCommodities[commodityType]) revert CommodityNotAuthorized();
        if (quantity == 0) revert ZeroQuantity();
        if (valueUSD == 0) revert ZeroValue();

        uint256 tokenId = _commodityTokenIdCounter;
        _commodityTokenIdCounter++;

        commodityMetadata[tokenId] = CommodityMetadata({
            commodityType: commodityType,
            origin: origin,
            quantity: quantity,
            valueUSD: valueUSD,
            minter: msg.sender,
            mintTimestamp: block.timestamp,
            qualityGrade: qualityGrade,
            isActive: true
        });

        emit CommodityNFTMinted(tokenId, commodityType, origin, msg.sender);
        return tokenId;
    }

    /**
     * @notice Record commodity arbitrage profit for supply chain tracking
     * @param commodityType The commodity type
     * @param profitUSD The profit in USD * 10^18
     * @param arbitrageType The arbitrage type (e.g., "cross-border", "seasonal")
     */
    function recordCommodityArbitrageProfit(
        string memory commodityType,
        uint256 profitUSD,
        string memory arbitrageType
    ) external whenNotPaused {
        if (!authorizedCommodities[commodityType]) revert CommodityNotAuthorized();
        if (profitUSD == 0) revert ZeroProfit();

        emit CommodityArbitrageProfit(commodityType, profitUSD, arbitrageType);
    }

    /**
     * @notice Get commodity metadata for audit trail
     * @param tokenId The NFT token ID
     */
    function getCommodityMetadata(uint256 tokenId) 
        external 
        view 
        returns (CommodityMetadata memory) 
    {
        return commodityMetadata[tokenId];
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
    error SelfReferral();
    error AffiliateShareFrozen();
    error InvalidPercent();
    error NotVault();
    error CommodityNotAuthorized();
    error ZeroQuantity();
    error ZeroValue();
    error ZeroProfit();
}
