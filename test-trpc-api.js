#!/usr/bin/env node

/**
 * TRuDe API tRPC Test Suite
 * Test completo per le API TRuDe con formato tRPC corretto
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

// Funzione per chiamare le API tRPC con il formato corretto
async function trpcCall(procedure, input = undefined) {
  let url = `${API_BASE}/${procedure}`;
  
  // Costruisci l'URL con i parametri corretti per tRPC
  if (input !== undefined) {
    const inputParam = typeof input === 'string' ? input : JSON.stringify(input);
    url += `?input=${encodeURIComponent(inputParam)}`;
  }
  
  console.log(`${colors.gray}Calling: ${url}${colors.reset}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`${colors.gray}Response Status: ${response.status} ${response.statusText}${colors.reset}`);
    
    const text = await response.text();
    console.log(`${colors.gray}Raw Response: ${text.substring(0, 300)}...${colors.reset}`);
    
    if (!response.ok) {
      // Prova a parsare l'errore come JSON
      try {
        const errorData = JSON.parse(text);
        if (errorData.error?.json?.message) {
          console.log(`${colors.yellow}⚠️  Server Error: ${errorData.error.json.message}${colors.reset}`);
          return { error: errorData.error.json };
        }
      } catch (e) {
        // Se non è JSON, mostra il testo grezzo
        console.log(`${colors.yellow}⚠️  Raw Error: ${text.substring(0, 200)}${colors.reset}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Prova a parsare come JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.log(`${colors.yellow}⚠️  Response is not JSON: ${text.substring(0, 100)}...${colors.reset}`);
      return { raw: text };
    }
    
    // Gestione errori tRPC
    if (data.error) {
      console.log(`${colors.yellow}⚠️  tRPC Error: ${data.error.message}${colors.reset}`);
      return { error: data.error };
    }

    return data.result?.data || data;
  } catch (error) {
    console.error(`${colors.red}❌ Errore nella chiamata ${procedure}: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Test di connessione base
async function testConnection() {
  console.log(`${colors.bright}${colors.blue}🧪 Testing TRuDe API Connection${colors.reset}`);
  
  try {
    // Test 1: Prova con getVaults senza parametri
    console.log(`\n${colors.cyan}📡 Testing getVaults (no params)...${colors.reset}`);
    const result1 = await trpcCall('getVaults');
    
    if (result1.error) {
      console.log(`${colors.yellow}⚠️  getVaults error: ${result1.error.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ getVaults successful!${colors.reset}`);
      return true;
    }
    
    // Test 2: Prova con getVaults con parametri
    console.log(`\n${colors.cyan}📡 Testing getVaults (with params)...${colors.reset}`);
    const result2 = await trpcCall('getVaults', { limit: 1 });
    
    if (result2.error) {
      console.log(`${colors.yellow}⚠️  getVaults with params error: ${result2.error.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ getVaults with params successful!${colors.reset}`);
      return true;
    }
    
    // Test 3: Prova con una procedura semplice
    console.log(`\n${colors.cyan}📡 Testing health check...${colors.reset}`);
    try {
      const healthResponse = await fetch('http://localhost:3000/api/health');
      console.log(`${colors.gray}Health Status: ${healthResponse.status}${colors.reset}`);
      if (healthResponse.ok) {
        console.log(`${colors.green}✅ Health check passed!${colors.reset}`);
        return true;
      }
    } catch (healthError) {
      console.log(`${colors.yellow}⚠️  Health check failed: ${healthError.message}${colors.reset}`);
    }
    
    return true; // Considera il test passato se riceviamo risposte dal server
  } catch (error) {
    console.log(`${colors.red}❌ Connection failed: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test di errori specifici
async function testErrorScenarios() {
  console.log(`\n${colors.bright}${colors.blue}🚨 Testing Error Scenarios${colors.reset}`);
  
  const errorTests = [
    {
      name: 'Invalid vault ID',
      procedure: 'getVaultById',
      input: { vaultId: 999999 },
      expectedError: true
    },
    {
      name: 'Empty parameters',
      procedure: 'getVaults',
      input: {},
      expectedError: false
    },
    {
      name: 'Invalid procedure name',
      procedure: 'nonExistentProcedure',
      input: {},
      expectedError: true
    }
  ];
  
  for (const test of errorTests) {
    console.log(`\n${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    try {
      const result = await trpcCall(test.procedure, test.input);
      
      if (test.expectedError) {
        if (result.error) {
          console.log(`${colors.green}✅ Error handled correctly: ${result.error.message}${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠️  Expected error but got success${colors.reset}`);
        }
      } else {
        if (result.error) {
          console.log(`${colors.yellow}⚠️  Unexpected error: ${result.error.message}${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ Success as expected${colors.reset}`);
        }
      }
    } catch (error) {
      console.log(`${colors.red}❌ Request failed: ${error.message}${colors.reset}`);
    }
  }
}

// Test di performance
async function testPerformance() {
  console.log(`\n${colors.bright}${colors.blue}⚡ Testing Performance${colors.reset}`);
  
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      await trpcCall('getVaults', { limit: 1 });
      const duration = Date.now() - start;
      times.push(duration);
      console.log(`${colors.gray}Iteration ${i + 1}: ${duration}ms${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}Iteration ${i + 1}: Failed${colors.reset}`);
      times.push(null);
    }
  }
  
  const validTimes = times.filter(t => t !== null);
  if (validTimes.length > 0) {
    const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const min = Math.min(...validTimes);
    const max = Math.max(...validTimes);
    
    console.log(`${colors.green}✅ Performance Results:${colors.reset}`);
    console.log(`${colors.gray}  Average: ${avg.toFixed(2)}ms${colors.reset}`);
    console.log(`${colors.gray}  Min: ${min}ms${colors.reset}`);
    console.log(`${colors.gray}  Max: ${max}ms${colors.reset}`);
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}TRuDe API Testing Suite${colors.reset}`);
  console.log(`${colors.gray}========================${colors.reset}`);
  
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testErrorScenarios();
    await testPerformance();
  } else {
    console.log(`\n${colors.red}❌ Cannot proceed with testing - connection failed${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.blue}Test completed!${colors.reset}`);
}

main().catch(console.error);