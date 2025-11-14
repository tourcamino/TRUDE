#!/usr/bin/env node

/**
 * TRuDe API Compatibility Test Suite
 * Test di compatibilità per diversi scenari d'uso
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

// Funzione per chiamare le API tRPC
async function trpcCall(procedure, input = undefined) {
  let url = `${API_BASE}/${procedure}`;
  
  if (input !== undefined) {
    const inputParam = typeof input === 'string' ? input : JSON.stringify(input);
    url += `?input=${encodeURIComponent(inputParam)}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const text = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(text);
        if (errorData.error?.json?.message) {
          return { error: errorData.error.json, status: response.status };
        }
      } catch (e) {
        return { error: { message: text }, status: response.status };
      }
      return { error: { message: response.statusText }, status: response.status };
    }

    try {
      const data = JSON.parse(text);
      return { data: data.result?.data || data, status: response.status };
    } catch (parseError) {
      return { data: text, status: response.status };
    }
  } catch (error) {
    return { error: { message: error.message }, status: 0 };
  }
}

// Test 1: Scenari di input diversi
async function testInputScenarios() {
  console.log(`${colors.bright}${colors.blue}📝 Testing Input Scenarios${colors.reset}`);
  
  const scenarios = [
    { name: 'Empty object', input: {} },
    { name: 'Null input', input: null },
    { name: 'String input', input: 'test' },
    { name: 'Number input', input: 123 },
    { name: 'Boolean input', input: true },
    { name: 'Array input', input: [1, 2, 3] },
    { name: 'Complex object', input: { limit: 10, offset: 0, filters: { active: true } } }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n${colors.cyan}🔍 Testing: ${scenario.name}${colors.reset}`);
    const result = await trpcCall('getVaults', scenario.input);
    
    if (result.error) {
      console.log(`${colors.yellow}⚠️  Error (${result.status}): ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Success (${result.status})${colors.reset}`);
      if (result.data) {
        console.log(`${colors.gray}Response type: ${typeof result.data}${colors.reset}`);
      }
    }
  }
}

// Test 2: Timeout e performance
async function testTimeoutScenarios() {
  console.log(`\n${colors.bright}${colors.blue}⏱️  Testing Timeout & Performance${colors.reset}`);
  
  const scenarios = [
    { name: 'Quick request', delay: 0 },
    { name: 'Multiple rapid requests', count: 10, delay: 100 }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n${colors.cyan}🔍 Testing: ${scenario.name}${colors.reset}`);
    
    if (scenario.count) {
      const times = [];
      for (let i = 0; i < scenario.count; i++) {
        const start = Date.now();
        await trpcCall('getVaults', {});
        const duration = Date.now() - start;
        times.push(duration);
        if (scenario.delay) await new Promise(resolve => setTimeout(resolve, scenario.delay));
      }
      
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      console.log(`${colors.gray}Average response time: ${avg.toFixed(2)}ms${colors.reset}`);
      console.log(`${colors.gray}Min: ${Math.min(...times)}ms, Max: ${Math.max(...times)}ms${colors.reset}`);
    } else {
      const start = Date.now();
      const result = await trpcCall('getVaults', {});
      const duration = Date.now() - start;
      
      console.log(`${colors.gray}Response time: ${duration}ms${colors.reset}`);
      if (result.error) {
        console.log(`${colors.yellow}⚠️  Error: ${result.error.message.substring(0, 50)}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Success${colors.reset}`);
      }
    }
  }
}

// Test 3: Error handling robustness
async function testErrorRobustness() {
  console.log(`\n${colors.bright}${colors.blue}🛡️  Testing Error Handling Robustness${colors.reset}`);
  
  const errorTests = [
    { name: 'Invalid procedure', procedure: 'thisProcedureDoesNotExist' },
    { name: 'SQL injection attempt', procedure: 'getVaults', input: { "'; DROP TABLE vaults; --": true } },
    { name: 'Very long string', procedure: 'getVaults', input: { test: 'a'.repeat(1000) } },
    { name: 'Special characters', procedure: 'getVaults', input: { test: '🚀⚡💎🔥🌟' } },
    { name: 'Unicode injection', procedure: 'getVaults', input: { test: '\u0000\u0001\u0002' } }
  ];
  
  for (const test of errorTests) {
    console.log(`\n${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    const result = await trpcCall(test.procedure, test.input);
    
    if (result.error) {
      console.log(`${colors.green}✅ Error handled gracefully (${result.status})${colors.reset}`);
      if (result.error.message.length > 100) {
        console.log(`${colors.gray}Error: ${result.error.message.substring(0, 100)}...${colors.reset}`);
      } else {
        console.log(`${colors.gray}Error: ${result.error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}⚠️  Unexpected success${colors.reset}`);
    }
  }
}

// Test 4: Concurrent requests
async function testConcurrentRequests() {
  console.log(`\n${colors.bright}${colors.blue}🔄 Testing Concurrent Requests${colors.reset}`);
  
  const concurrentCount = 5;
  console.log(`\n${colors.cyan}🔍 Testing: ${concurrentCount} concurrent requests${colors.reset}`);
  
  const start = Date.now();
  const promises = [];
  
  for (let i = 0; i < concurrentCount; i++) {
    promises.push(trpcCall('getVaults', {}));
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - start;
  
  const successCount = results.filter(r => !r.error).length;
  const errorCount = results.filter(r => r.error).length;
  
  console.log(`${colors.gray}Total time: ${totalTime}ms${colors.reset}`);
  console.log(`${colors.green}✅ Successful: ${successCount}/${concurrentCount}${colors.reset}`);
  if (errorCount > 0) {
    console.log(`${colors.red}❌ Failed: ${errorCount}/${concurrentCount}${colors.reset}`);
  }
  
  // Testa la concorrenza con diverse procedure
  console.log(`\n${colors.cyan}🔍 Testing: Mixed concurrent procedures${colors.reset}`);
  const mixedPromises = [
    trpcCall('getVaults', {}),
    trpcCall('getDashboardStats'),
    trpcCall('getRevenueMetrics', { rangeDays: 30 }),
    trpcCall('getUserDashboard', { userAddress: '0x123' }),
    trpcCall('prepareDeposit', { userAddress: '0x123', vaultId: 1, amountDecimal: '100' })
  ];
  
  const mixedResults = await Promise.all(mixedPromises);
  const mixedSuccess = mixedResults.filter(r => !r.error).length;
  
  console.log(`${colors.green}✅ Mixed requests successful: ${mixedSuccess}/${mixedPromises.length}${colors.reset}`);
}

// Test 5: Memory and resource usage
async function testResourceUsage() {
  console.log(`\n${colors.bright}${colors.blue}💾 Testing Resource Usage${colors.reset}`);
  
  const iterations = 20;
  console.log(`\n${colors.cyan}🔍 Testing: ${iterations} sequential requests${colors.reset}`);
  
  const start = Date.now();
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const iterStart = Date.now();
    await trpcCall('getVaults', {});
    const iterDuration = Date.now() - iterStart;
    times.push(iterDuration);
    
    if (i % 5 === 0) {
      console.log(`${colors.gray}Iteration ${i + 1}: ${iterDuration}ms${colors.reset}`);
    }
  }
  
  const totalTime = Date.now() - start;
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  
  console.log(`${colors.gray}Total time: ${totalTime}ms${colors.reset}`);
  console.log(`${colors.gray}Average time: ${avgTime.toFixed(2)}ms${colors.reset}`);
  console.log(`${colors.gray}Time trend: ${times[0]}ms → ${times[times.length - 1]}ms${colors.reset}`);
  
  // Check for performance degradation
  const firstHalf = times.slice(0, iterations / 2);
  const secondHalf = times.slice(iterations / 2);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg * 1.2) {
    console.log(`${colors.yellow}⚠️  Performance degradation detected: ${firstAvg.toFixed(2)}ms → ${secondAvg.toFixed(2)}ms${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Stable performance${colors.reset}`);
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}TRuDe API Compatibility Test Suite${colors.reset}`);
  console.log(`${colors.gray}====================================${colors.reset}`);
  
  await testInputScenarios();
  await testTimeoutScenarios();
  await testErrorRobustness();
  await testConcurrentRequests();
  await testResourceUsage();
  
  console.log(`\n${colors.bright}${colors.blue}All compatibility tests completed!${colors.reset}`);
}

main().catch(console.error);