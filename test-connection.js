#!/usr/bin/env node

/**
 * TRuDe API Connection Test
 * Test di base per verificare la connessione all'API
 */

const API_BASE = 'http://localhost:3000/trpc';

// Colori per output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

async function testConnection() {
  console.log(`${colors.bright}${colors.blue}🧪 Testing TRuDe API Connection${colors.reset}`);
  console.log(`${colors.gray}API Base: ${API_BASE}${colors.reset}`);
  
  try {
    // Test 1: Connessione base
    console.log(`\n${colors.cyan}📡 Testing basic connection...${colors.reset}`);
    const response = await fetch(`${API_BASE}/getVaults?input=%7B%22limit%22%3A1%7D`);
    
    console.log(`${colors.gray}Status: ${response.status}${colors.reset}`);
    console.log(`${colors.gray}Status Text: ${response.statusText}${colors.reset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`${colors.green}✅ Connection successful!${colors.reset}`);
    console.log(`${colors.gray}Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Connection failed: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testErrorScenarios() {
  console.log(`\n${colors.bright}${colors.blue}🚨 Testing Error Scenarios${colors.reset}`);
  
  const errorTests = [
    {
      name: 'Invalid vault ID',
      url: `${API_BASE}/getVaultById?input=%7B%22vaultId%22%3A999999%7D`,
      expectedError: true
    },
    {
      name: 'Missing parameters',
      url: `${API_BASE}/prepareDeposit?input=%7B%7D`,
      expectedError: true
    },
    {
      name: 'Invalid address format',
      url: `${API_BASE}/getUserDashboard?input=%7B%22userAddress%22%3A%22invalid%22%7D`,
      expectedError: true
    },
    {
      name: 'Non-existent procedure',
      url: `${API_BASE}/nonExistentProcedure`,
      expectedError: true
    }
  ];
  
  for (const test of errorTests) {
    console.log(`\n${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      console.log(`${colors.gray}Status: ${response.status}${colors.reset}`);
      
      if (test.expectedError) {
        if (data.error || response.status >= 400) {
          console.log(`${colors.green}✅ Error handled correctly${colors.reset}`);
          if (data.error) {
            console.log(`${colors.gray}Error: ${data.error.message}${colors.reset}`);
          }
        } else {
          console.log(`${colors.yellow}⚠️  Unexpected success - may need validation${colors.reset}`);
        }
      }
    } catch (error) {
      console.log(`${colors.red}❌ Request failed: ${error.message}${colors.reset}`);
    }
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}TRuDe API Error Testing Suite${colors.reset}`);
  console.log(`${colors.gray}================================${colors.reset}`);
  
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testErrorScenarios();
  } else {
    console.log(`\n${colors.red}❌ Cannot proceed with error testing - connection failed${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.blue}Test completed!${colors.reset}`);
}

main().catch(console.error);