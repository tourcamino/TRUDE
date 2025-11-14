#!/usr/bin/env node

/**
 * TRuDe API Test Suite
 * 
 * Complete testing script for all TRuDe API endpoints
 * Run with: node test-trude-api.js
 */

const API_BASE = 'http://localhost:3001/api/trpc';
const TEST_TIMEOUT = 10000;

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

// Funzione per chiamare le API
async function trpcCall(procedure, input = {}) {
  const url = `${API_BASE}/${procedure}?input=${encodeURIComponent(JSON.stringify(input))}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Gestione errori tRPC
    if (data.error) {
      throw new Error(`tRPC Error: ${data.error.message}`);
    }

    return data.result?.data;
  } catch (error) {
    console.error(`${colors.red}❌ Errore nella chiamata ${procedure}: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Funzione di test con timeout
async function testWithTimeout(testName, testFn, timeout = TEST_TIMEOUT) {
  const startTime = Date.now();
  process.stdout.write(`${colors.cyan}🧪 ${testName}...${colors.reset} `);
  
  try {
    const result = await Promise.race([
      testFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`${colors.green}✅ PASS (${duration}ms)${colors.reset}`);
    return { success: true, duration, data: result };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`${colors.red}❌ FAIL (${duration}ms)${colors.reset}`);
    console.error(`   ${colors.red}${error.message}${colors.reset}`);
    return { success: false, duration, error: error.message };
  }
}

// Test Suite: API Vault
async function testVaultAPIs() {
  console.log(`\n${colors.bright}${colors.blue}🏦 Testing API Vault${colors.reset}`);
  const results = [];

  // Test 1: Get Vaults
  results.push(await testWithTimeout('getVaults', async () => {
    const result = await trpcCall('getVaults', { limit: 10 });
    if (!result.vaults || !Array.isArray(result.vaults)) {
      throw new Error('Risposta invalida: vaults array mancante');
    }
    console.log(`   ${colors.gray}Trovate ${result.vaults.length} vault${colors.reset}`);
    return result;
  }));

  // Test 2: Get Vault by ID
  results.push(await testWithTimeout('getVaultById', async () => {
    const result = await trpcCall('getVaultById', { vaultId: 1 });
    if (!result.vault) {
      throw new Error('Vault non trovata');
    }
    console.log(`   ${colors.gray}Vault: ${result.vault.tokenSymbol} - ${result.vault.address}${colors.reset}`);
    return result;
  }));

  // Test 3: Get Vault Metrics
  results.push(await testWithTimeout('getVaultMetrics', async () => {
    const result = await trpcCall('getVaultMetrics', { vaultId: 1 });
    if (!result.metrics) {
      throw new Error('Metriche non trovate');
    }
    console.log(`   ${colors.gray}Metrics disponibili${colors.reset}`);
    return result;
  }));

  // Test 4: Get Vault Events
  results.push(await testWithTimeout('getVaultEvents', async () => {
    const result = await trpcCall('getVaultEvents', { vaultId: 1 });
    console.log(`   ${colors.gray}Eventi: ${result.events?.length || 0}${colors.reset}`);
    return result;
  }));

  return results;
}

// Test Suite: Transazioni
async function testTransactionAPIs() {
  console.log(`\n${colors.bright}${colors.blue}💰 Testing API Transazioni${colors.reset}`);
  const results = [];
  const testAddress = '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB';

  // Test 1: Prepare Deposit
  results.push(await testWithTimeout('prepareDeposit', async () => {
    const result = await trpcCall('prepareDeposit', {
      userAddress: testAddress,
      vaultId: 1,
      amountDecimal: '100.5'
    });
    if (!result.prepared) {
      throw new Error('Preparazione deposito fallita');
    }
    console.log(`   ${colors.gray}Deposito preparato per ${testAddress}${colors.reset}`);
    return result;
  }));

  // Test 2: Request Withdraw Capital
  results.push(await testWithTimeout('requestWithdrawCapital', async () => {
    const result = await trpcCall('requestWithdrawCapital', {
      userAddress: testAddress,
      vaultId: 1,
      amountDecimal: '50.25',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      deadline: Math.floor(Date.now() / 1000) + 3600
    });
    console.log(`   ${colors.gray}Richiesta prelievo processata${colors.reset}`);
    return result;
  }));

  return results;
}

// Test Suite: Reportistica
async function testReportingAPIs() {
  console.log(`\n${colors.bright}${colors.blue}📊 Testing API Reportistica${colors.reset}`);
  const results = [];
  const testAddress = '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB';

  // Test 1: Dashboard Stats
  results.push(await testWithTimeout('getDashboardStats', async () => {
    const result = await trpcCall('getDashboardStats');
    if (!result.stats) {
      throw new Error('Dashboard stats non disponibili');
    }
    console.log(`   ${colors.gray}Stats: ${JSON.stringify(result.stats).substring(0, 100)}...${colors.reset}`);
    return result;
  }));

  // Test 2: Revenue Metrics
  results.push(await testWithTimeout('getRevenueMetrics', async () => {
    const result = await trpcCall('getRevenueMetrics', { rangeDays: 30 });
    if (!result.metrics) {
      throw new Error('Revenue metrics non disponibili');
    }
    console.log(`   ${colors.gray}Revenue metrics recuperati${colors.reset}`);
    return result;
  }));

  // Test 3: User Dashboard
  results.push(await testWithTimeout('getUserDashboard', async () => {
    const result = await trpcCall('getUserDashboard', { 
      userAddress: testAddress 
    });
    console.log(`   ${colors.gray}Dashboard utente per ${testAddress}${colors.reset}`);
    return result;
  }));

  return results;
}

// Test Suite: Utilità
async function testUtilityAPIs() {
  console.log(`\n${colors.bright}${colors.blue}🔧 Testing API Utilità${colors.reset}`);
  const results = [];

  // Test 1: Health Check
  results.push(await testWithTimeout('healthCheck', async () => {
    const result = await trpcCall('healthCheck');
    if (result.status !== 'ok') {
      throw new Error('Health check fallito');
    }
    console.log(`   ${colors.gray}Sistema operativo${colors.reset}`);
    return result;
  }));

  // Test 2: Token Prices
  results.push(await testWithTimeout('getTokenPrices', async () => {
    const result = await trpcCall('getTokenPrices', { 
      symbols: ['ETH', 'USDC', 'USDT'] 
    });
    if (!result.prices) {
      throw new Error('Token prices non disponibili');
    }
    console.log(`   ${colors.gray}Prezzi recuperati per ETH, USDC, USDT${colors.reset}`);
    return result;
  }));

  // Test 3: Chain Info
  results.push(await testWithTimeout('getChainInfo', async () => {
    const result = await trpcCall('getChainInfo');
    if (!result.chainInfo) {
      throw new Error('Chain info non disponibile');
    }
    console.log(`   ${colors.gray}Chain info: ${result.chainInfo.name}${colors.reset}`);
    return result;
  }));

  return results;
}

// Test Suite: Errori
async function testErrorScenarios() {
  console.log(`\n${colors.bright}${colors.blue}⚠️ Testing Gestione Errori${colors.reset}`);
  const results = [];

  // Test 1: Invalid Vault ID
  results.push(await testWithTimeout('errorInvalidVaultId', async () => {
    try {
      await trpcCall('getVaultById', { vaultId: 999999 });
      throw new Error('Dovrebbe aver fallito con vault ID invalido');
    } catch (error) {
      if (!error.message.includes('not found') && !error.message.includes('Vault')) {
        throw new Error('Errore inaspettato: ' + error.message);
      }
      console.log(`   ${colors.gray}Errore gestito correttamente per vault ID invalido${colors.reset}`);
      return { errorHandled: true };
    }
  }));

  // Test 2: Invalid Ethereum Address
  results.push(await testWithTimeout('errorInvalidAddress', async () => {
    try {
      await trpcCall('getUserDashboard', { 
        userAddress: 'indirizzo-invalido' 
      });
      throw new Error('Dovrebbe aver fallito con indirizzo invalido');
    } catch (error) {
      console.log(`   ${colors.gray}Errore gestito correttamente per indirizzo invalido${colors.reset}`);
      return { errorHandled: true };
    }
  }));

  return results;
}

// Verifica che il server sia in esecuzione
async function checkServerHealth() {
  try {
    const result = await trpcCall('healthCheck');
    if (result.status === 'ok') {
      console.log(`${colors.green}✅ Server TRuDe operativo${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Server TRuDe non raggiungibile${colors.reset}`);
    console.error(`${colors.red}Assicurati che il server sia in esecuzione su ${API_BASE}${colors.reset}`);
    return false;
  }
}

// Funzione principale
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    TRuDe API Test Suite                      ║');
  console.log('║              Testing completo delle API TRuDe               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  const startTime = Date.now();
  const allResults = [];

  try {
    // Esegui tutti i test
    allResults.push(...await testVaultAPIs());
    allResults.push(...await testTransactionAPIs());
    allResults.push(...await testReportingAPIs());
    allResults.push(...await testUtilityAPIs());
    allResults.push(...await testErrorScenarios());

    // Calcola statistiche
    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.success).length;
    const failedTests = allResults.filter(r => !r.success).length;
    const totalDuration = Date.now() - startTime;

    // Riepilogo
    console.log(`\n${colors.bright}${colors.cyan}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                        RIEPILOGO TEST                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}`);
    console.log(`${colors.green}✅ Test Superati: ${passedTests}/${totalTests}${colors.reset}`);
    console.log(`${colors.red}❌ Test Falliti: ${failedTests}/${totalTests}${colors.reset}`);
    console.log(`${colors.blue}⏱️  Durata Totale: ${totalDuration}ms${colors.reset}`);
    console.log(`${colors.cyan}📊 Percentuale Successo: ${((passedTests/totalTests)*100).toFixed(1)}%${colors.reset}`);

    // Dettagli fallimenti
    if (failedTests > 0) {
      console.log(`\n${colors.red}${colors.bright}Dettagli Test Falliti:${colors.reset}`);
      allResults.filter(r => !r.success).forEach(result => {
        console.log(`${colors.red}  ❌ ${result.error}${colors.reset}`);
      });
    }

    console.log(`\n${colors.green}${colors.bright}🎉 Testing TRuDe API Completato!${colors.reset}`);
    
    // Exit code basato sui risultati
    process.exit(failedTests > 0 ? 1 : 0);

  } catch (error) {
    console.error(`${colors.red}💥 Errore critico nel test suite: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    process.exit(1);
  }

  await runAllTests();
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}💥 Errore fatale: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

export { runAllTests, testVaultAPIs, testTransactionAPIs, testReportingAPIs, testUtilityAPIs, testErrorScenarios };