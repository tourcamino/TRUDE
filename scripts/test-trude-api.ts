// Script di test completo per le API di TRuDe
// Questo script può essere eseguito per testare tutte le API in modo automatico

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
  data?: any;
  error?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

// Configurazione base per i test
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  timeout: 10000,
  retries: 3,
  testUserAddress: '0x742d35Cc6634C0532925a3b8D0D39D8F9F0aE2aB',
  testVaultId: 1,
  testToken: 'ETH'
};

// Funzione per eseguire chiamate API
async function apiCall(endpoint: string, data?: any): Promise<any> {
  const url = `${TEST_CONFIG.baseUrl}/api/trpc/${endpoint}`;
  const params = data ? `?input=${encodeURIComponent(JSON.stringify(data))}` : '';
  
  const response = await fetch(url + params, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Gestione errori tRPC
  if (result.error) {
    throw new Error(`tRPC Error: ${result.error.message}`);
  }

  return result.result?.data;
}

// Test Suite: Vault API
async function testVaultAPIs(): Promise<TestSuite> {
  const startTime = Date.now();
  const tests: TestResult[] = [];

  console.log('🧪 Testing Vault APIs...');

  // Test 1: Get Vaults
  try {
    const start = Date.now();
    const result = await apiCall('getVaults', { limit: 10 });
    tests.push({
      name: 'getVaults',
      status: 'pass',
      message: `✅ Retrieved ${result.vaults?.length || 0} vaults`,
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getVaults',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 2: Get Vault by ID
  try {
    const start = Date.now();
    const result = await apiCall('getVaultById', { vaultId: TEST_CONFIG.testVaultId });
    tests.push({
      name: 'getVaultById',
      status: 'pass',
      message: `✅ Retrieved vault ${TEST_CONFIG.testVaultId}`,
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getVaultById',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 3: Get Vault Metrics
  try {
    const start = Date.now();
    const result = await apiCall('getVaultMetrics', { vaultId: TEST_CONFIG.testVaultId });
    tests.push({
      name: 'getVaultMetrics',
      status: 'pass',
      message: '✅ Retrieved vault metrics',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getVaultMetrics',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 4: Get Vault Events
  try {
    const start = Date.now();
    const result = await apiCall('getVaultEvents', { vaultId: TEST_CONFIG.testVaultId });
    tests.push({
      name: 'getVaultEvents',
      status: 'pass',
      message: `✅ Retrieved ${result.events?.length || 0} events`,
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getVaultEvents',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;
  const skipped = tests.filter(t => t.status === 'skip').length;

  return {
    name: 'Vault APIs',
    tests,
    total: tests.length,
    passed,
    failed,
    skipped,
    duration: Date.now() - startTime
  };
}

// Test Suite: Transaction APIs
async function testTransactionAPIs(): Promise<TestSuite> {
  const startTime = Date.now();
  const tests: TestResult[] = [];

  console.log('💰 Testing Transaction APIs...');

  // Test 1: Prepare Deposit
  try {
    const start = Date.now();
    const result = await apiCall('prepareDeposit', {
      userAddress: TEST_CONFIG.testUserAddress,
      vaultId: TEST_CONFIG.testVaultId,
      amountDecimal: '100.5'
    });
    tests.push({
      name: 'prepareDeposit',
      status: 'pass',
      message: '✅ Deposit prepared successfully',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'prepareDeposit',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 2: Request Withdraw Capital
  try {
    const start = Date.now();
    const result = await apiCall('requestWithdrawCapital', {
      userAddress: TEST_CONFIG.testUserAddress,
      vaultId: TEST_CONFIG.testVaultId,
      amountDecimal: '50.25',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      deadline: Math.floor(Date.now() / 1000) + 3600
    });
    tests.push({
      name: 'requestWithdrawCapital',
      status: 'pass',
      message: '✅ Withdrawal request processed',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'requestWithdrawCapital',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;

  return {
    name: 'Transaction APIs',
    tests,
    total: tests.length,
    passed,
    failed,
    skipped: 0,
    duration: Date.now() - startTime
  };
}

// Test Suite: Reporting APIs
async function testReportingAPIs(): Promise<TestSuite> {
  const startTime = Date.now();
  const tests: TestResult[] = [];

  console.log('📊 Testing Reporting APIs...');

  // Test 1: Dashboard Stats
  try {
    const start = Date.now();
    const result = await apiCall('getDashboardStats');
    tests.push({
      name: 'getDashboardStats',
      status: 'pass',
      message: '✅ Dashboard stats retrieved',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getDashboardStats',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 2: Revenue Metrics
  try {
    const start = Date.now();
    const result = await apiCall('getRevenueMetrics', { rangeDays: 30 });
    tests.push({
      name: 'getRevenueMetrics',
      status: 'pass',
      message: '✅ Revenue metrics retrieved',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getRevenueMetrics',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 3: User Dashboard
  try {
    const start = Date.now();
    const result = await apiCall('getUserDashboard', { 
      userAddress: TEST_CONFIG.testUserAddress 
    });
    tests.push({
      name: 'getUserDashboard',
      status: 'pass',
      message: '✅ User dashboard retrieved',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getUserDashboard',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;

  return {
    name: 'Reporting APIs',
    tests,
    total: tests.length,
    passed,
    failed,
    skipped: 0,
    duration: Date.now() - startTime
  };
}

// Test Suite: Utility APIs
async function testUtilityAPIs(): Promise<TestSuite> {
  const startTime = Date.now();
  const tests: TestResult[] = [];

  console.log('🔧 Testing Utility APIs...');

  // Test 1: Health Check
  try {
    const start = Date.now();
    const result = await apiCall('healthCheck');
    tests.push({
      name: 'healthCheck',
      status: result.status === 'ok' ? 'pass' : 'fail',
      message: result.status === 'ok' ? '✅ System is healthy' : '❌ System health check failed',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'healthCheck',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 2: Token Prices
  try {
    const start = Date.now();
    const result = await apiCall('getTokenPrices', { 
      symbols: ['ETH', 'USDC', 'USDT'] 
    });
    tests.push({
      name: 'getTokenPrices',
      status: 'pass',
      message: '✅ Token prices retrieved',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getTokenPrices',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 3: Chain Info
  try {
    const start = Date.now();
    const result = await apiCall('getChainInfo');
    tests.push({
      name: 'getChainInfo',
      status: 'pass',
      message: '✅ Chain info retrieved',
      duration: Date.now() - start,
      data: result
    });
  } catch (error: any) {
    tests.push({
      name: 'getChainInfo',
      status: 'fail',
      message: `❌ Failed: ${error.message}`,
      duration: Date.now() - startTime,
      error
    });
  }

  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;

  return {
    name: 'Utility APIs',
    tests,
    total: tests.length,
    passed,
    failed,
    skipped: 0,
    duration: Date.now() - startTime
  };
}

// Error Testing
async function testErrorScenarios(): Promise<TestSuite> {
  const startTime = Date.now();
  const tests: TestResult[] = [];

  console.log('⚠️ Testing Error Scenarios...');

  // Test 1: Invalid Vault ID
  try {
    const start = Date.now();
    await apiCall('getVaultById', { vaultId: 999999 });
    tests.push({
      name: 'errorInvalidVaultId',
      status: 'fail',
      message: '❌ Should have failed with invalid vault ID',
      duration: Date.now() - start
    });
  } catch (error: any) {
    tests.push({
      name: 'errorInvalidVaultId',
      status: 'pass',
      message: '✅ Properly handled invalid vault ID',
      duration: Date.now() - startTime,
      error
    });
  }

  // Test 2: Invalid Ethereum Address
  try {
    const start = Date.now();
    await apiCall('getUserDashboard', { 
      userAddress: 'invalid-ethereum-address' 
    });
    tests.push({
      name: 'errorInvalidAddress',
      status: 'fail',
      message: '❌ Should have failed with invalid address',
      duration: Date.now() - start
    });
  } catch (error: any) {
    tests.push({
      name: 'errorInvalidAddress',
      status: 'pass',
      message: '✅ Properly handled invalid address',
      duration: Date.now() - startTime,
      error
    });
  }

  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;

  return {
    name: 'Error Handling',
    tests,
    total: tests.length,
    passed,
    failed,
    skipped: 0,
    duration: Date.now() - startTime
  };
}

// Main test runner
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting TRuDe API Test Suite...\n');
  
  const startTime = Date.now();
  const testSuites: TestSuite[] = [];

  try {
    // Run all test suites
    testSuites.push(await testVaultAPIs());
    testSuites.push(await testTransactionAPIs());
    testSuites.push(await testReportingAPIs());
    testSuites.push(await testUtilityAPIs());
    testSuites.push(await testErrorScenarios());

    // Calculate totals
    const totalTests = testSuites.reduce((sum, suite) => sum + suite.total, 0);
    const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalSkipped = testSuites.reduce((sum, suite) => sum + suite.skipped, 0);
    const totalDuration = Date.now() - startTime;

    // Print summary
    console.log('\n📋 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log('='.repeat(50));

    // Print detailed results
    testSuites.forEach(suite => {
      console.log(`\n${suite.name}:`);
      console.log('-'.repeat(30));
      suite.tests.forEach(test => {
        console.log(`${test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⏭️'} ${test.name}: ${test.message}`);
        if (test.duration) {
          console.log(`   Duration: ${test.duration}ms`);
        }
      });
    });

    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);

  } catch (error: any) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

export { runAllTests, testVaultAPIs, testTransactionAPIs, testReportingAPIs, testUtilityAPIs, testErrorScenarios };