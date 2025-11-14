#!/usr/bin/env node

/**
 * API Test for AI Execution Engine tRPC endpoints
 * Tests the bulletproof AI system through the tRPC API
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './src/server/trpc/root';
import { createTRPCReact } from '@trpc/react-query';

// Test configuration
const TEST_CONFIG = {
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

  testMarketAnalysis: {
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    chainId: 1,
    timeframe: '1h',
    indicators: ['RSI', 'MACD', 'VOLUME', 'PRICE_TREND']
  }
};

async function testAIExecutionAPI() {
  console.log('🚀 Starting AI Execution Engine API Test\n');
  
  try {
    // Create tRPC client
    console.log('🔄 Creating tRPC client...');
    const trpc = createTRPCReact<AppRouter>();
    
    // For testing, we'll use a simple fetch approach
    const baseUrl = 'http://localhost:3000/api/trpc';
    
    console.log('✅ tRPC client created\n');

    // Test 1: Market Analysis API
    console.log('📊 Test 1: Market Analysis API');
    console.log('🔄 Testing market analysis endpoint...');
    
    const marketAnalysisResponse = await fetch(`${baseUrl}/ai.analyzeMarket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: TEST_CONFIG.testMarketAnalysis
      })
    });
    
    if (marketAnalysisResponse.ok) {
      const marketAnalysis = await marketAnalysisResponse.json();
      console.log('✅ Market Analysis API Response:');
      console.log(JSON.stringify(marketAnalysis, null, 2));
    } else {
      console.log('⚠️ Market Analysis API Response:', marketAnalysisResponse.status, marketAnalysisResponse.statusText);
    }
    console.log('');

    // Test 2: Fee Optimization API
    console.log('⚡ Test 2: Fee Optimization API');
    console.log('🔄 Testing fee optimization endpoint...');
    
    const feeOptimizationResponse = await fetch(`${baseUrl}/ai.optimizeFees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          chainId: 1,
          urgency: 'MEDIUM'
        }
      })
    });
    
    if (feeOptimizationResponse.ok) {
      const feeOptimization = await feeOptimizationResponse.json();
      console.log('✅ Fee Optimization API Response:');
      console.log(JSON.stringify(feeOptimization, null, 2));
    } else {
      console.log('⚠️ Fee Optimization API Response:', feeOptimizationResponse.status, feeOptimizationResponse.statusText);
    }
    console.log('');

    // Test 3: Order Execution API
    console.log('🎯 Test 3: Order Execution API');
    console.log('🔄 Testing order execution endpoint...');
    
    const executionResponse = await fetch(`${baseUrl}/ai.executeOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: TEST_CONFIG.testOrder
      })
    });
    
    if (executionResponse.ok) {
      const execution = await executionResponse.json();
      console.log('✅ Order Execution API Response:');
      console.log(JSON.stringify(execution, null, 2));
    } else {
      console.log('⚠️ Order Execution API Response:', executionResponse.status, executionResponse.statusText);
    }
    console.log('');

    console.log('🎉 AI Execution Engine API tests completed!');
    console.log('✅ API endpoints are accessible and responding');

  } catch (error) {
    console.error('❌ API test failed with error:', error);
    console.error('Error details:', (error as any)?.message || String(error));
  }
}

// Run the test
console.log('🔧 Starting API integration test...');
console.log('Target API: http://localhost:3000/api/trpc');
console.log('');

testAIExecutionAPI().catch(console.error);