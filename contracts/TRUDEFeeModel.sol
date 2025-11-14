// Implementazione Smart Contract per nuovo modello fee
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TRUDEFeeModel is ReentrancyGuard, Ownable {
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // Constructor can remain empty as we're just setting the owner
    }
    
    // Struttura dati per tracciare performance utente
    struct UserPerformance {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 profitRealized;
        uint256 lastFeePayment;
        uint256 entryTime;
    }
    
    // Parametri fee dinamiche
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
    
    // Stato del contratto
    mapping(address => UserPerformance) public userPerformances;
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userProfits;
    
    uint256 public totalAUM;
    uint256 public totalProfitsGenerated;
    uint256 public totalFeesCollected;
    
    // Eventi
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount, uint256 profit, uint256 fee);
    event FeeCollected(address indexed user, uint256 amount, uint256 feeRate);
    event PerformanceUpdated(address indexed user, uint256 profit, uint256 feeRate);
    
    
    // Deposito senza fee
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        
        UserPerformance storage user = userPerformances[msg.sender];
        
        // Aggiorna dati utente
        user.totalDeposited += amount;
        userDeposits[msg.sender] += amount;
        
        if (user.entryTime == 0) {
            user.entryTime = block.timestamp;
        }
        
        totalAUM += amount;
        
        // Trasferimento token (假设 USDC)
        // IERC20(usdcToken).transferFrom(msg.sender, address(this), amount);
        
        emit Deposit(msg.sender, amount);
    }
    
    // Prelievo con fee solo su profitti
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(userDeposits[msg.sender] >= amount, "Insufficient balance");
        
        UserPerformance storage user = userPerformances[msg.sender];
        
        // Calcola profitto realizzato
        uint256 profit = 0;
        uint256 fee = 0;
        
        if (amount > user.totalDeposited - user.totalWithdrawn) {
            // Stiamo prelevando profitti
            profit = amount - (user.totalDeposited - user.totalWithdrawn);
            
            // Calcola fee dinamica
            uint256 feeRate = calculateDynamicFeeRate(profit, user.totalDeposited);
            fee = (profit * feeRate) / FEE_DENOMINATOR;
            
            // Aggiorna profitti utente
            user.profitRealized += profit;
            userProfits[msg.sender] += profit;
            totalProfitsGenerated += profit;
            totalFeesCollected += fee;
            
            emit FeeCollected(msg.sender, fee, feeRate);
        }
        
        // Aggiorna dati utente
        user.totalWithdrawn += amount;
        userDeposits[msg.sender] -= amount;
        user.lastFeePayment = block.timestamp;
        totalAUM -= amount;
        
        // Trasferimento netto (amount - fee)
        uint256 netAmount = amount - fee;
        // IERC20(usdcToken).transfer(msg.sender, netAmount);
        
        emit Withdraw(msg.sender, amount, profit, fee);
    }
    
    // Calcola fee dinamica basata su performance
    function calculateDynamicFeeRate(uint256 profit, uint256 principal) 
        public 
        pure 
        returns (uint256) 
    {
        if (principal == 0) return BASE_FEE_TIER_1;
        
        uint256 profitPercentage = (profit * 10000) / principal;
        
        if (profitPercentage <= PROFIT_THRESHOLD_1) {
            return BASE_FEE_TIER_1; // 10%
        } else if (profitPercentage <= PROFIT_THRESHOLD_2) {
            return BASE_FEE_TIER_2; // 15%
        } else if (profitPercentage <= PROFIT_THRESHOLD_3) {
            return BASE_FEE_TIER_3; // 20%
        } else if (profitPercentage <= PROFIT_THRESHOLD_4) {
            return BASE_FEE_TIER_4; // 25%
        } else {
            return BASE_FEE_TIER_5; // 30%
        }
    }
    
    // Funzione per stimare fee prima di prelevare
    function estimateWithdrawalFee(address user, uint256 amount) 
        external 
        view 
        returns (uint256 fee, uint256 feeRate, uint256 netAmount) 
    {
        UserPerformance memory userData = userPerformances[user];
        
        if (amount <= userData.totalDeposited - userData.totalWithdrawn) {
            return (0, 0, amount); // Nessun profitto, nessuna fee
        }
        
        uint256 profit = amount - (userData.totalDeposited - userData.totalWithdrawn);
        feeRate = calculateDynamicFeeRate(profit, userData.totalDeposited);
        fee = (profit * feeRate) / FEE_DENOMINATOR;
        netAmount = amount - fee;
        
        return (fee, feeRate, netAmount);
    }
    
    // Ottieni statistiche utente
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 deposited,
            uint256 withdrawn,
            uint256 profitRealized,
            uint256 currentBalance,
            uint256 totalProfit,
            uint256 avgFeeRate
        ) 
    {
        UserPerformance memory userData = userPerformances[user];
        
        deposited = userData.totalDeposited;
        withdrawn = userData.totalWithdrawn;
        profitRealized = userData.profitRealized;
        currentBalance = userDeposits[user];
        totalProfit = userData.profitRealized;
        
        // Calcola fee rate media storica
        if (userData.profitRealized > 0) {
            uint256 totalFees = 0;
            // Questo è un calcolo semplificato
            avgFeeRate = calculateDynamicFeeRate(userData.profitRealized, userData.totalDeposited);
        } else {
            avgFeeRate = 0;
        }
        
        return (deposited, withdrawn, profitRealized, currentBalance, totalProfit, avgFeeRate);
    }
    
    // Ottieni statistiche globali
    function getGlobalStats() 
        external 
        view 
        returns (
            uint256 _totalAUM,
            uint256 _totalProfitsGenerated,
            uint256 _totalFeesCollected,
            uint256 _avgFeeRate,
            uint256 _protocolAge
        ) 
    {
        _totalAUM = totalAUM;
        _totalProfitsGenerated = totalProfitsGenerated;
        _totalFeesCollected = totalFeesCollected;
        
        // Calcola fee rate media
        if (totalProfitsGenerated > 0) {
            _avgFeeRate = (totalFeesCollected * FEE_DENOMINATOR) / totalProfitsGenerated;
        } else {
            _avgFeeRate = 0;
        }
        
        _protocolAge = block.timestamp;
        
        return (_totalAUM, _totalProfitsGenerated, _totalFeesCollected, _avgFeeRate, _protocolAge);
    }
}