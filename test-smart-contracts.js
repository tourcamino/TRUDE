#!/usr/bin/env node

/**
 * TRuDe API Smart Contract Integration Testing
 * Test di integrazione con smart contracts e blockchain
 */

const API_BASE = 'http://localhost:3000/trpc';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

// Helper per chiamate API
async function trpcCall(procedure, input) {
  let url = `${API_BASE}/${procedure}`;
  if (input !== undefined) {
    url += `?input=${encodeURIComponent(JSON.stringify(input))}`;
  }
  
  try {
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const text = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(text);
        return { error: errorData.error?.json || { message: text }, status: response.status };
      } catch {
        return { error: { message: text }, status: response.status };
      }
    }
    
    try {
      const data = JSON.parse(text);
      return { data: data.result?.data || data, status: response.status };
    } catch {
      return { data: text, status: response.status };
    }
  } catch (error) {
    return { error: { message: error.message }, status: 0 };
  }
}

// Test 1: Transaction Hash Validation
async function testTransactionHashValidation() {
  console.log(`${colors.bright}${colors.magenta}🔗 Transaction Hash Validation${colors.reset}`);
  
  const hashTests = [
    { name: 'Valid hash', hash: '0x' + '1'.repeat(64), valid: true },
    { name: 'All zeros', hash: '0x' + '0'.repeat(64), valid: true },
    { name: 'All Fs', hash: '0x' + 'f'.repeat(64), valid: true },
    { name: 'No 0x prefix', hash: '1'.repeat(64), valid: false },
    { name: 'Too short', hash: '0x' + '1'.repeat(63), valid: false },
    { name: 'Too long', hash: '0x' + '1'.repeat(65), valid: false },
    { name: 'Invalid chars', hash: '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', valid: false },
    { name: 'Empty hash', hash: '', valid: false }
  ];
  
  for (const test of hashTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    const result = await trpcCall('finalizeWithdrawCapital', {
      userAddress: '0x' + '1'.repeat(40),
      requestId: 1,
      txHash: test.hash
    });
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Rejected valid hash: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid hash accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid hash correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.red}🚨 Invalid hash accepted!${colors.reset}`);
      }
    }
  }
}

// Test 2: Chain ID and Network Validation
async function testChainValidation() {
  console.log(`\n${colors.bright}${colors.magenta}⛓️  Chain & Network Validation${colors.reset}`);
  
  const chainTests = [
    { name: 'Ethereum Mainnet', chainId: 1, valid: true },
    { name: 'Polygon', chainId: 137, valid: true },
    { name: 'Arbitrum', chainId: 42161, valid: true },
    { name: 'Optimism', chainId: 10, valid: true },
    { name: 'Base', chainId: 8453, valid: true },
    { name: 'Invalid chain', chainId: 99999, valid: false },
    { name: 'Zero chain', chainId: 0, valid: false },
    { name: 'Negative chain', chainId: -1, valid: false }
  ];
  
  for (const test of chainTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name} (Chain ID: ${test.chainId})${colors.reset}`);
    
    const result = await trpcCall('prepareDeposit', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amountDecimal: '100',
      chainId: test.chainId
    });
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Valid chain rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid chain accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid chain correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Invalid chain accepted${colors.reset}`);
      }
    }
  }
}

// Test 3: Gas Price and Fee Validation
async function testGasValidation() {
  console.log(`\n${colors.bright}${colors.magenta}⛽ Gas & Fee Validation${colors.reset}`);
  
  const gasTests = [
    { name: 'Normal gas price', gasPrice: '20000000000', valid: true }, // 20 Gwei
    { name: 'High gas price', gasPrice: '1000000000000', valid: true }, // 1000 Gwei
    { name: 'Low gas price', gasPrice: '1000000000', valid: true }, // 1 Gwei
    { name: 'Zero gas price', gasPrice: '0', valid: false },
    { name: 'Very high gas', gasPrice: '1000000000000000', valid: true }, // 1M Gwei
    { name: 'Negative gas price', gasPrice: '-1', valid: false },
    { name: 'Decimal gas price', gasPrice: '20.5', valid: false },
    { name: 'Scientific notation', gasPrice: '1e10', valid: false }
  ];
  
  for (const test of gasTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name} (${test.gasPrice})${colors.reset}`);
    
    const result = await trpcCall('prepareDeposit', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amountDecimal: '100',
      gasPrice: test.gasPrice
    });
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Valid gas rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid gas price accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid gas price correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Invalid gas price accepted${colors.reset}`);
      }
    }
  }
}

// Test 4: Signature Validation
async function testSignatureValidation() {
  console.log(`\n${colors.bright}${colors.magenta}✍️ Signature Validation${colors.reset}`);
  
  const signatureTests = [
    { name: 'Valid signature', sig: '0x' + '1'.repeat(130), valid: true },
    { name: 'All zeros signature', sig: '0x' + '0'.repeat(130), valid: true },
    { name: 'All Fs signature', sig: '0x' + 'f'.repeat(130), valid: true },
    { name: 'No 0x prefix', sig: '1'.repeat(130), valid: false },
    { name: 'Too short signature', sig: '0x' + '1'.repeat(129), valid: false },
    { name: 'Too long signature', sig: '0x' + '1'.repeat(131), valid: false },
    { name: 'Invalid hex signature', sig: '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', valid: false },
    { name: 'Empty signature', sig: '', valid: false }
  ];
  
  for (const test of signatureTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    const result = await trpcCall('requestWithdrawCapital', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amountDecimal: '100',
      signature: test.sig,
      deadline: Math.floor(Date.now() / 1000) + 3600
    });
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Valid signature rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid signature accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid signature correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Invalid signature accepted${colors.reset}`);
      }
    }
  }
}

// Test 5: Block Number and Timestamp Validation
async function testBlockValidation() {
  console.log(`\n${colors.bright}${colors.magenta}🧱 Block & Timestamp Validation${colors.reset}`);
  
  const currentBlock = 18500000; // Approximate current Ethereum block
  const currentTimestamp = Math.floor(Date.now() / 1000);
  
  const blockTests = [
    { name: 'Current block', blockNumber: currentBlock, valid: true },
    { name: 'Future block', blockNumber: currentBlock + 1000, valid: true },
    { name: 'Past block', blockNumber: currentBlock - 10000, valid: true },
    { name: 'Genesis block', blockNumber: 0, valid: true },
    { name: 'Very high block', blockNumber: 99999999, valid: true },
    { name: 'Negative block', blockNumber: -1, valid: false },
    { name: 'Current timestamp', timestamp: currentTimestamp, valid: true },
    { name: 'Future timestamp', timestamp: currentTimestamp + 86400, valid: true },
    { name: 'Past timestamp', timestamp: currentTimestamp - 86400, valid: true },
    { name: 'Zero timestamp', timestamp: 0, valid: true },
    { name: 'Far future timestamp', timestamp: currentTimestamp + 31536000, valid: true }, // +1 year
    { name: 'Negative timestamp', timestamp: -1, valid: false }
  ];
  
  for (const test of blockTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name} (${test.blockNumber || test.timestamp})${colors.reset}`);
    
    const params = {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amountDecimal: '100'
    };
    
    if (test.blockNumber) {
      params.blockNumber = test.blockNumber;
    }
    if (test.timestamp) {
      params.timestamp = test.timestamp;
    }
    
    const result = await trpcCall('prepareDeposit', params);
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Valid block/timestamp rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid block/timestamp accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid block/timestamp correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Invalid block/timestamp accepted${colors.reset}`);
      }
    }
  }
}

// Test 6: Contract Address Validation
async function testContractAddressValidation() {
  console.log(`\n${colors.bright}${colors.magenta}🏛️ Contract Address Validation${colors.reset}`);
  
  // Indirizzi di contratti noti (non usare questi in produzione)
  const contractTests = [
    { name: 'USDC Contract', address: '0xA0b86a33E6441b17145553CEB2bB2E2E1E4E7E6f', valid: true },
    { name: 'WETH Contract', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', valid: true },
    { name: 'Uniswap Router', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', valid: true },
    { name: 'Invalid checksum', address: '0xa0b86a33e6441b17145553ceb2bb2e2e1e4e7e6f', valid: false }, // lowercase
    { name: 'Non-contract address', address: '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB', valid: true }, // EOA
    { name: 'Zero address', address: '0x0000000000000000000000000000000000000000', valid: false },
    { name: 'Invalid format', address: '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', valid: false }
  ];
  
  for (const test of contractTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name} (${test.address})${colors.reset}`);
    
    const result = await trpcCall('createVault', {
      tokenAddress: test.address,
      tokenSymbol: 'TEST',
      ownerAddress: '0x' + '1'.repeat(40),
      ledgerAddress: '0x' + '2'.repeat(40)
    });
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Valid address rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid address accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid address correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Invalid address accepted${colors.reset}`);
      }
    }
  }
}

// Test 7: Event Log Validation
async function testEventLogValidation() {
  console.log(`\n${colors.bright}${colors.magenta}📋 Event Log Validation${colors.reset}`);
  
  const eventTests = [
    { name: 'Valid event', fromBlock: 18500000, toBlock: 18500100, valid: true },
    { name: 'Wide range', fromBlock: 18500000, toBlock: 18510000, valid: true },
    { name: 'Single block', fromBlock: 18500000, toBlock: 18500000, valid: true },
    { name: 'Reversed range', fromBlock: 18500100, toBlock: 18500000, valid: false },
    { name: 'Future blocks', fromBlock: 99999999, toBlock: 100000000, valid: true },
    { name: 'Zero blocks', fromBlock: 0, toBlock: 1000, valid: true },
    { name: 'Negative blocks', fromBlock: -100, toBlock: 0, valid: false },
    { name: 'Huge range', fromBlock: 1, toBlock: 99999999, valid: false } // Should be limited
  ];
  
  for (const test of eventTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name} (${test.fromBlock}-${test.toBlock})${colors.reset}`);
    
    const result = await trpcCall('getVaultEvents', {
      vaultId: 1,
      fromBlock: test.fromBlock,
      toBlock: test.toBlock
    });
    
    if (test.valid) {
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Valid range rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Valid range accepted${colors.reset}`);
      }
    } else {
      if (result.error) {
        console.log(`${colors.green}✅ Invalid range correctly rejected${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Invalid range accepted${colors.reset}`);
      }
    }
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}⛓️ TRuDe API Smart Contract Integration Testing${colors.reset}`);
  console.log(`${colors.gray}==============================================${colors.reset}`);
  
  await testTransactionHashValidation();
  await testChainValidation();
  await testGasValidation();
  await testSignatureValidation();
  await testBlockValidation();
  await testContractAddressValidation();
  await testEventLogValidation();
  
  console.log(`\n${colors.bright}${colors.green}✅ Smart contract integration tests completed!${colors.reset}\n`);
}

main().catch(console.error);