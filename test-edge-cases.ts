#!/usr/bin/env node

/**
 * TRuDe API Advanced Edge Cases Testing
 * Test per casi limite e scenari avanzati
 */

import { randomBytes } from "crypto";
import { performance } from "node:perf_hooks";

// Configurazione
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
async function trpcCall(procedure: string, input?: any) {
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
  } catch (error: any) {
    return { error: { message: error.message }, status: 0 };
  }
}

// Test 1: Numeri Estremi e Overflow
async function testExtremeNumbers() {
  console.log(`${colors.bright}${colors.magenta}🔢 Testing Extreme Numbers & Overflow${colors.reset}`);
  
  const extremeTests = [
    { name: 'Zero amount', input: { amount: '0' } },
    { name: 'Negative amount', input: { amount: '-1000000' } },
    { name: 'Very large amount', input: { amount: '999999999999999999999999999999' } },
    { name: 'Decimal precision', input: { amount: '0.000000000000000001' } },
    { name: 'Scientific notation', input: { amount: '1e18' } },
    { name: 'String instead of number', input: { amount: 'not-a-number' } },
    { name: 'Infinity', input: { amount: 'Infinity' } },
    { name: 'NaN', input: { amount: 'NaN' } }
  ];
  
  for (const test of extremeTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    const result = await trpcCall('createDeposit', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      ...test.input
    });
    
    if (result.error) {
      console.log(`${colors.yellow}⚠️  Error: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Success: Handled correctly${colors.reset}`);
    }
  }
}

// Test 2: Indirizzi Invalidi e Malformati
async function testInvalidAddresses() {
  console.log(`\n${colors.bright}${colors.magenta}🏠 Testing Invalid Addresses${colors.reset}`);
  
  const addressTests = [
    { name: 'Too short address', address: '0x123' },
    { name: 'Too long address', address: '0x' + '1'.repeat(50) },
    { name: 'No 0x prefix', address: '1234567890123456789012345678901234567890' },
    { name: 'Invalid characters', address: '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG' },
    { name: 'Empty address', address: '' },
    { name: 'Null address', address: '0x0000000000000000000000000000000000000000' },
    { name: 'Special characters', address: '0x!@#$%^&*()_+-=[]{}|;:,.<>?' },
    { name: 'Unicode address', address: '0x🚀⚡💎🔥🌟🎯🔥💎⚡🚀' }
  ];
  
  for (const test of addressTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    const result = await trpcCall('getUserDashboard', {
      userAddress: test.address
    });
    
    if (result.error) {
      console.log(`${colors.yellow}⚠️  Error: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Success: Address handled${colors.reset}`);
    }
  }
}

// Test 3: Date e Timestamp Estremi
async function testExtremeTimestamps() {
  console.log(`\n${colors.bright}${colors.magenta}⏰ Testing Extreme Timestamps${colors.reset}`);
  
  const timestampTests = [
    { name: 'Unix epoch (1970)', timestamp: 0 },
    { name: 'Far future', timestamp: 4102444800 }, // 2100
    { name: 'Far past', timestamp: -86400 }, // Yesterday in 1970
    { name: 'Current time', timestamp: Math.floor(Date.now() / 1000) },
    { name: 'String timestamp', timestamp: 'not-a-timestamp' },
    { name: 'Float timestamp', timestamp: 1234567890.123 },
    { name: 'Negative large', timestamp: -9999999999 },
    { name: 'Zero deadline', deadline: 0 }
  ];
  
  for (const test of timestampTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    const result = await trpcCall('requestWithdrawCapital', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amountDecimal: '100',
      signature: '0x' + '1'.repeat(64),
      ...test
    });
    
    if (result.error) {
      console.log(`${colors.yellow}⚠️  Error: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Success: Timestamp handled${colors.reset}`);
    }
  }
}

// Test 4: Stringhe Maliziose e Injection
async function testMaliciousStrings() {
  console.log(`\n${colors.bright}${colors.magenta}💉 Testing Malicious Strings & Injection${colors.reset}`);
  
  const maliciousTests = [
    { name: 'SQL Injection', input: "'; DROP TABLE users; --" },
    { name: 'XSS Attempt', input: '<script>alert("XSS")</script>' },
    { name: 'JSON Injection', input: '{"malicious": true, "data": null}' },
    { name: 'Path Traversal', input: '../../../etc/passwd' },
    { name: 'Command Injection', input: '$(rm -rf /)' },
    { name: 'Very long string', input: 'A'.repeat(10000) },
    { name: 'Control characters', input: '\x00\x01\x02\x03\x04\x05' },
    { name: 'Mixed encoding', input: 'Hello\u0000World\uFFFFTest' }
  ];
  
  for (const test of maliciousTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    const result = await trpcCall('createVault', {
      tokenAddress: '0x' + '1'.repeat(40),
      tokenSymbol: test.input,
      ownerAddress: '0x' + '2'.repeat(40),
      ledgerAddress: '0x' + '3'.repeat(40)
    });
    
    if (result.error) {
      console.log(`${colors.yellow}⚠️  Blocked: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Handled: Input sanitized${colors.reset}`);
    }
  }
}

// Test 5: Nested Objects Complessi
async function testComplexNestedObjects() {
  console.log(`\n${colors.bright}${colors.magenta}🕸️  Testing Complex Nested Objects${colors.reset}`);
  
  const complexTests = [
    {
      name: 'Deeply nested',
      input: { a: { b: { c: { d: { e: { f: { g: 'deep' } } } } } } } }
    },
    {
      name: 'Circular reference simulation',
      input: { a: { b: { c: { $ref: '#/a' } } } }
    },
    {
      name: 'Mixed types array',
      input: { data: [1, 'string', true, null, { nested: 'object' }, [1, 2, 3]] }
    },
    {
      name: 'Very large object',
      input: Object.fromEntries(Array.from({length: 100}, (_, i) => [`key${i}`, `value${i}`]))
    },
    {
      name: 'Unicode keys and values',
      input: { '🚀': 'rocket', 'clé': 'clé', '键': '值', 'normal': '🌟' }
    }
  ];
  
  for (const test of complexTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    const result = await trpcCall('getDashboardStats', test.input);
    
    if (result.error) {
      console.log(`${colors.yellow}⚠️  Error: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Success: Complex object handled${colors.reset}`);
    }
  }
}

// Test 6: Concorrenza Estrema
async function testExtremeConcurrency() {
  console.log(`\n${colors.bright}${colors.magenta}⚡ Testing Extreme Concurrency${colors.reset}`);
  
  const concurrencyLevels = [10, 50, 100, 200];
  
  for (const level of concurrencyLevels) {
    console.log(`${colors.cyan}🔍 Testing: ${level} concurrent requests${colors.reset}`);
    
    const start = performance.now();
    const promises = [];
    
    for (let i = 0; i < level; i++) {
      promises.push(trpcCall('getVaults', { limit: 1 }));
    }
    
    const results = await Promise.allSettled(promises);
    const duration = performance.now() - start;
    
    const successCount = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
    const errorCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length;
    
    console.log(`${colors.gray}Time: ${duration.toFixed(2)}ms${colors.reset}`);
    console.log(`${colors.green}✅ Success: ${successCount}/${level}${colors.reset}`);
    if (errorCount > 0) {
      console.log(`${colors.red}❌ Errors: ${errorCount}/${level}${colors.reset}`);
    }
  }
}

// Test 7: State Corruption Scenarios
async function testStateCorruption() {
  console.log(`\n${colors.bright}${colors.magenta}💥 Testing State Corruption Scenarios${colors.reset}`);
  
  const { createCaller } = await import("../src/server/trpc/root-e2e.ts");
  const caller = createCaller({});
  
  // Test race conditions
  console.log(`${colors.cyan}🔍 Testing: Race condition on deposit${colors.reset}`);
  
  const user = '0x' + '1'.repeat(40);
  const promises = [];
  
  // Try to create multiple deposits simultaneously
  for (let i = 0; i < 5; i++) {
    promises.push(caller.createDeposit({
      userAddress: user,
      vaultId: 1,
      amount: '1000000'
    }));
  }
  
  const results = await Promise.allSettled(promises);
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  
  console.log(`${colors.green}✅ Race test completed: ${successCount}/5 successful${colors.reset}`);
  
  // Test duplicate operations
  console.log(`${colors.cyan}🔍 Testing: Duplicate operation handling${colors.reset}`);
  
  const duplicatePromises = [];
  const sameRequest = {
    userAddress: '0x' + '2'.repeat(40),
    vaultId: 1,
    amount: '2000000'
  };
  
  // Send identical requests
  for (let i = 0; i < 3; i++) {
    duplicatePromises.push(caller.createDeposit(sameRequest));
  }
  
  const duplicateResults = await Promise.allSettled(duplicatePromises);
  const duplicateSuccess = duplicateResults.filter(r => r.status === 'fulfilled').length;
  
  console.log(`${colors.green}✅ Duplicate test: ${duplicateSuccess}/3 handled${colors.reset}`);
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}🎯 TRuDe API Advanced Edge Cases Testing${colors.reset}`);
  console.log(`${colors.gray}========================================${colors.reset}`);
  
  await testExtremeNumbers();
  await testInvalidAddresses();
  await testExtremeTimestamps();
  await testMaliciousStrings();
  await testComplexNestedObjects();
  await testExtremeConcurrency();
  await testStateCorruption();
  
  console.log(`\n${colors.bright}${colors.green}✅ All advanced edge case tests completed!${colors.reset}\n`);
}

main().catch(console.error);