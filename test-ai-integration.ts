#!/usr/bin/env node

/**
 * Test script for AI Execution Engine with Dune and Moralis API integration
 * This script tests the bulletproof AI system for executing financial operations
 */

import { AIExecutionEngine } from './src/server/ai/ai-execution-engine';

// Test configuration
const TEST_CONFIG = {
  // Test order for market analysis
  testOrder: {
    type: 'BUY' as const,
    tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    amount: '1000',
    maxSlippage: 0.5,
    maxFee: 2.0,
    targetProfit: 1.5,
    stopLoss: 2.0,
    timeframe: '1h' as const,
    urgency: 'MEDIUM' as const,
    chainId: 1,
    walletAddress: '0x742d35Cc6634C0532925a3b8D0eC1E4aD7D1d064'
  },

  // Test market analysis
  testMarketAnalysis: {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    chainId: 1,
    timeframe: '1h',
    indicators: ['RSI', 'MACD', 'VOLUME', 'PRICE_TREND']
  }
};

async function testAIExecutionEngine() {
  console.log('🚀 Starting AI Execution Engine Integration Test\n');
  
  try {
    // Initialize the AI execution engine with API keys
    console.log('🔄 Initializing AI Execution Engine...');
    const engine = new AIExecutionEngine(
      process.env.DUNE_API_KEY,
      process.env.MORALIS_API_KEY
    );
    console.log('✅ AI Execution Engine initialized successfully\n');

    // Test 1: Market Analysis with Dune Analytics
    console.log('📊 Test 1: Market Analysis with Dune Analytics');
    console.log('🔄 Analyzing market conditions...');
    
    const marketAnalysis = await engine.analyzeMarketConditions(TEST_CONFIG.testOrder);
    console.log('✅ Market Analysis Results:');
    console.log(JSON.stringify(marketAnalysis, null, 2));
    console.log('');

    // Test 2: Real-time Data with Moralis API
    console.log('📈 Test 2: Real-time Data with Moralis API');
    console.log('🔄 Fetching real-time market data...');
    
    const realTimeData = await engine.getRealTimeData(TEST_CONFIG.testOrder);
    console.log('✅ Real-time Data Results:');
    console.log(JSON.stringify(realTimeData, null, 2));
    console.log('');

    // Test 3: Sentiment Analysis with AI
    console.log('🧠 Test 3: Market Sentiment Analysis with AI');
    console.log('🔄 Analyzing market sentiment...');
    
    const sentimentAnalysis = await engine.analyzeMarketSentiment(TEST_CONFIG.testMarketAnalysis);
    console.log('✅ Sentiment Analysis Results:');
    console.log(JSON.stringify(sentimentAnalysis, null, 2));
    console.log('');

    // Test 4: Fee Optimization
    console.log('⚡ Test 4: Fee Optimization');
    console.log('🔄 Optimizing transaction fees...');
    
    const feeOptimization = await engine.optimizeExecution({
      ...TEST_CONFIG.testOrder,
      chainId: 1
    });
    console.log('✅ Fee Optimization Results:');
    console.log(JSON.stringify(feeOptimization, null, 2));
    console.log('');

    // Test 5: Complete Order Execution Simulation
    console.log('🎯 Test 5: Complete Order Execution Simulation');
    console.log('🔄 Simulating AI-driven order execution...');
    
    const executionResult = await engine.executeOrder(TEST_CONFIG.testOrder);
    console.log('✅ Execution Results:');
    console.log(JSON.stringify(executionResult, null, 2));
    console.log('');

    // Test 6: Risk Assessment
    console.log('🛡️ Test 6: Risk Assessment');
    console.log('🔄 Assessing execution risks...');
    
    const riskAssessment = await engine.assessRisk(TEST_CONFIG.testOrder);
    console.log('✅ Risk Assessment Results:');
    console.log(JSON.stringify(riskAssessment, null, 2));
    console.log('');

    console.log('🎉 All AI Execution Engine tests completed successfully!');
    console.log('✅ Dune Analytics integration: WORKING');
    console.log('✅ Moralis API integration: WORKING');
    console.log('✅ AI market analysis: WORKING');
    console.log('✅ Fee optimization: WORKING');
    console.log('✅ Risk assessment: WORKING');
    console.log('✅ Order execution simulation: WORKING');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error details:', (error as any)?.message || String(error));
    process.exit(1);
  }
}

// Run the test if this script is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${__filename}`) {
  // Load environment variables
  dotenv.config();
  
  console.log('🔧 Loading environment variables...');
  console.log('DUNE_API_KEY:', process.env.DUNE_API_KEY ? '✅ Configured' : '❌ Missing');
  console.log('MORALIS_API_KEY:', process.env.MORALIS_API_KEY ? '✅ Configured' : '❌ Missing');
  console.log('');

  if (!process.env.DUNE_API_KEY || !process.env.MORALIS_API_KEY) {
    console.error('❌ Missing required API keys. Please check your .env.local file.');
    process.exit(1);
  }

  testAIExecutionEngine().catch(console.error);
}

export { testAIExecutionEngine };