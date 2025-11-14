/**
 * TruDe Complete Integration Example
 * Esempio end-to-end di come gaming e supply chain si integrano con smart contract
 */

import { ethers } from 'ethers';
import { TruDeGamingContractAdapter } from '../gaming/TruDeGamingContractAdapter';
import { TruDeSupplyChainContractAdapter } from '../supply-chain/TruDeSupplyChainContractAdapter';
import { getNetworkConfig } from '../config/networks';

export class TruDeCompleteIntegrationExample {
  
  async runCompleteExample() {
    console.log('🚀 Starting TruDe Complete Integration Example\n');

    // Setup provider e wallet (test scenario)
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const wallet = new ethers.Wallet('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', provider);
    
    // Network configuration
    const networkConfig = getNetworkConfig('polygon');
    const factoryAddress = '0xFactoryAddress123456789'; // Indirizzo reale della factory

    console.log(`🔗 Connected to ${networkConfig.name} (Chain ID: ${networkConfig.chainId})`);
    console.log(`💳 Wallet: ${wallet.address}\n`);

    // ========================================
    // ESEMPIO 1: Gaming Integration
    // ========================================
    console.log('🎮 GAMING INTEGRATION EXAMPLE');
    console.log('='.repeat(50));

    const gamingAdapter = new TruDeGamingContractAdapter(
      networkConfig,
      provider,
      wallet,
      factoryAddress
    );

    // Esempio: Axie Lending Strategy
    const axieResult = await gamingAdapter.executeAxieLendingStrategy(
      wallet.address, // userAddress
      [12345, 12346, 12347], // axieIds
      14, // lendingDuration (days)
      1000 // investmentAmount (USD)
    );

    if (axieResult.success) {
      console.log(`✅ Axie Lending Completed Successfully!`);
      console.log(`📊 Investment: $${axieResult.investmentAmount}`);
      console.log(`💰 Expected Profit: $${axieResult.expectedProfit.toFixed(2)}`);
      console.log(`💵 Actual Profit: $${axieResult.actualProfit.toFixed(2)}`);
      console.log(`🎯 Net Profit (after fees): $${axieResult.netProfit.toFixed(2)}`);
      console.log(`📈 APY: ${axieResult.apy.toFixed(1)}%`);
      console.log(`🔒 Vault: ${axieResult.vaultAddress}`);
      console.log(`📝 Tx Hash: ${axieResult.transactionHash}\n`);
    } else {
      console.log(`❌ Axie Lending Failed: ${axieResult.error}\n`);
    }

    // ========================================
    // ESEMPIO 2: Supply Chain Integration
    // ========================================
    console.log('🏭 SUPPLY CHAIN INTEGRATION EXAMPLE');
    console.log('='.repeat(50));

    const supplyChainAdapter = new TruDeSupplyChainContractAdapter(
      networkConfig,
      provider,
      wallet,
      factoryAddress
    );

    // Esempio: Commodity Arbitrage Strategy
    const commodityResult = await supplyChainAdapter.executeCommodityArbitrageStrategy(
      wallet.address, // enterpriseAddress
      'GOLD', // commodity
      50000, // amount (USD)
      'Binance', // sourceMarket
      'Bybit', // targetMarket
      7 // timeHorizon (days)
    );

    if (commodityResult.success) {
      console.log(`✅ Commodity Arbitrage Completed Successfully!`);
      console.log(`📊 Commodity: ${commodityResult.commodity}`);
      console.log(`💰 Investment: $${commodityResult.amount.toLocaleString()}`);
      console.log(`🔄 Markets: ${commodityResult.sourceMarket} → ${commodityResult.targetMarket}`);
      console.log(`💵 Expected Profit: $${commodityResult.expectedProfit.toFixed(2)}`);
      console.log(`💎 Actual Profit: $${commodityResult.actualProfit.toFixed(2)}`);
      console.log(`🎯 Net Profit (after fees): $${commodityResult.netProfit.toFixed(2)}`);
      console.log(`📈 Return: ${commodityResult.returnPercentage.toFixed(2)}%`);
      console.log(`⏱️  Time Horizon: ${commodityResult.timeHorizon} days`);
      console.log(`⚠️  Risk Level: ${commodityResult.riskLevel}`);
      console.log(`🔒 Vault: ${commodityResult.vaultAddress}`);
      console.log(`📝 Tx Hash: ${commodityResult.transactionHash}\n`);
    } else {
      console.log(`❌ Commodity Arbitrage Failed: ${commodityResult.error}\n`);
    }

    // ========================================
    // ESEMPIO 3: Trade Finance Integration
    // ========================================
    console.log('💼 TRADE FINANCE INTEGRATION EXAMPLE');
    console.log('='.repeat(50));

    const invoiceDueDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days from now
    const tradeFinanceResult = await supplyChainAdapter.executeTradeFinanceStrategy(
      wallet.address, // enterpriseAddress
      75000, // invoiceAmount (USD)
      invoiceDueDate, // invoiceDueDate
      2.5, // discountRate (%)
      'USDC' // collateralToken
    );

    if (tradeFinanceResult.success) {
      console.log(`✅ Trade Finance Optimization Completed Successfully!`);
      console.log(`📋 Invoice Amount: $${tradeFinanceResult.invoiceAmount.toLocaleString()}`);
      console.log(`📅 Days Until Due: ${tradeFinanceResult.daysUntilDue}`);
      console.log(`💰 Expected Savings: $${tradeFinanceResult.expectedSavings.toFixed(2)}`);
      console.log(`💵 Actual Savings: $${tradeFinanceResult.actualSavings.toFixed(2)}`);
      console.log(`🎯 Net Savings (after fees): $${tradeFinanceResult.netSavings.toFixed(2)}`);
      console.log(`📈 Annualized Return: ${tradeFinanceResult.annualizedReturn.toFixed(2)}%`);
      console.log(`⚠️  Risk Level: ${tradeFinanceResult.riskLevel}`);
      console.log(`🔒 Vault: ${tradeFinanceResult.vaultAddress}`);
      console.log(`📝 Tx Hash: ${tradeFinanceResult.transactionHash}\n`);
    } else {
      console.log(`❌ Trade Finance Failed: ${tradeFinanceResult.error}\n`);
    }

    // ========================================
    // RIEPILOGO FINALE
    // ========================================
    console.log('📊 INTEGRATION SUMMARY');
    console.log('='.repeat(50));
    
    const totalInvested = 1000 + 50000 + 75000; // Somma degli investimenti
    const totalNetProfit = (axieResult.netProfit || 0) + (commodityResult.netProfit || 0) + (tradeFinanceResult.netSavings || 0);
    const avgReturn = (totalNetProfit / totalInvested) * 100;

    console.log(`💰 Total Invested: $${totalInvested.toLocaleString()}`);
    console.log(`💵 Total Net Returns: $${totalNetProfit.toFixed(2)}`);
    console.log(`📈 Average Return: ${avgReturn.toFixed(2)}%`);
    console.log(`🎯 Success Rate: ${[axieResult, commodityResult, tradeFinanceResult].filter(r => r.success).length}/3`);
    
    console.log('\n✨ Integration example completed successfully!');
  }

  /**
   * Esempio di flusso completo con error handling
   */
  async runRobustIntegrationExample() {
    console.log('🛡️  ROBUST INTEGRATION WITH ERROR HANDLING');
    console.log('='.repeat(60));

    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const wallet = new ethers.Wallet('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', provider);
    const networkConfig = getNetworkConfig('polygon');
    const factoryAddress = '0xFactoryAddress123456789';

    const strategies = [
      {
        name: 'Gaming - Axie Lending',
        execute: async () => {
          const adapter = new TruDeGamingContractAdapter(networkConfig, provider, wallet, factoryAddress);
          return await adapter.executeAxieLendingStrategy(wallet.address, [12345, 12346], 7, 500);
        }
      },
      {
        name: 'Supply Chain - Gold Arbitrage',
        execute: async () => {
          const adapter = new TruDeSupplyChainContractAdapter(networkConfig, provider, wallet, factoryAddress);
          return await adapter.executeCommodityArbitrageStrategy(wallet.address, 'GOLD', 25000, 'Binance', 'Kraken', 5);
        }
      },
      {
        name: 'Trade Finance - Invoice Factoring',
        execute: async () => {
          const adapter = new TruDeSupplyChainContractAdapter(networkConfig, provider, wallet, factoryAddress);
          const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return await adapter.executeTradeFinanceStrategy(wallet.address, 50000, dueDate, 3, 'USDC');
        }
      }
    ];

    const results = [];
    
    for (const strategy of strategies) {
      try {
        console.log(`\n🎯 Executing: ${strategy.name}`);
        const result = await strategy.execute();
        results.push({ name: strategy.name, result, success: result.success });
        
        if (result.success) {
          console.log(`✅ Success: ${result.netProfit ? '$' + result.netProfit.toFixed(2) : '$' + result.netSavings?.toFixed(2)} net return`);
        } else {
          console.log(`❌ Failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`💥 Critical Error: ${error.message}`);
        results.push({ name: strategy.name, success: false, error: error.message });
      }
    }

    // Riepilogo finale
    console.log('\n📈 ROBUST INTEGRATION SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`🎯 Strategies Attempted: ${total}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${total - successful}`);
    console.log(`📊 Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}:`);
      console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (result.success && result.result) {
        const netReturn = result.result.netProfit || result.result.netSavings || 0;
        console.log(`   Net Return: $${netReturn.toFixed(2)}`);
      } else if (!result.success) {
        console.log(`   Error: ${result.error || result.result?.error || 'Unknown error'}`);
      }
    });

    console.log('\n✨ Robust integration example completed!');
  }
}

// Esegui l'esempio se questo file viene eseguito direttamente
if (require.main === module) {
  const example = new TruDeCompleteIntegrationExample();
  
  console.log('🚀 TruDe Complete Integration Example');
  console.log('This example demonstrates how gaming and supply chain adapters integrate with TruDe smart contracts.\n');
  
  // Esegui l'esempio base
  example.runCompleteExample().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('Now running robust integration with error handling...\n');
    
    // Poi esegui l'esempio robusto
    return example.runRobustIntegrationExample();
  }).then(() => {
    console.log('\n🎉 All integration examples completed successfully!');
  }).catch(error => {
    console.error('Integration example failed:', error);
  });
}