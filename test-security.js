#!/usr/bin/env node

/**
 * TRuDe API Security & Vulnerability Testing
 * Test di sicurezza per identificare vulnerabilità potenziali
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

// Test 1: Authentication Bypass Attempts
async function testAuthenticationBypass() {
  console.log(`${colors.bright}${colors.magenta}🔓 Testing Authentication Bypass${colors.reset}`);
  
  const authTests = [
    { name: 'Empty auth header', headers: { Authorization: '' } },
    { name: 'Malformed JWT', headers: { Authorization: 'Bearer invalid.token.here' } },
    { name: 'SQL injection in auth', headers: { Authorization: "Bearer ' OR 1=1 --" } },
    { name: 'No auth header', headers: {} },
    { name: 'Expired token simulation', headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ' } }
  ];
  
  for (const test of authTests) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    try {
      const response = await fetch(`${API_BASE}/getDashboardStats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...test.headers
        }
      });
      
      if (response.status === 401) {
        console.log(`${colors.green}✅ Correctly blocked: ${response.status}${colors.reset}`);
      } else if (response.status === 200) {
        console.log(`${colors.red}🚨 POTENTIAL BYPASS: ${response.status}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Unexpected response: ${response.status}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Request failed: ${error.message}${colors.reset}`);
    }
  }
}

// Test 2: SQL Injection Advanced
async function testSQLInjection() {
  console.log(`\n${colors.bright}${colors.magenta}💉 Advanced SQL Injection Testing${colors.reset}`);
  
  const sqlInjectionPayloads = [
    { name: 'Union select', input: "' UNION SELECT * FROM users--" },
    { name: 'Boolean blind', input: "' AND 1=1--" },
    { name: 'Time-based blind', input: "'; WAITFOR DELAY '00:00:05'--" },
    { name: 'Stacked queries', input: "'; DROP TABLE vaults;--" },
    { name: 'Error-based', input: "' AND 1=CONVERT(int, (SELECT @@version))--" },
    { name: 'Second-order injection', input: "test'; INSERT INTO logs(message) VALUES('injected')--" },
    { name: 'NoSQL injection', input: '{"$ne": null}' },
    { name: 'MongoDB injection', input: '{"$where": "this.sleep(1000)"}' }
  ];
  
  for (const test of sqlInjectionPayloads) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    const result = await trpcCall('getVaults', { 
      limit: 10, 
      search: test.input 
    });
    
    if (result.error && result.error.message.includes('timeout')) {
      console.log(`${colors.red}🚨 TIME-BASED INJECTION DETECTED!${colors.reset}`);
    } else if (result.error && result.error.message.includes('syntax')) {
      console.log(`${colors.red}🚨 SQL ERROR DETECTED!${colors.reset}`);
    } else if (result.error) {
      console.log(`${colors.green}✅ Blocked: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Sanitized correctly${colors.reset}`);
    }
  }
}

// Test 3: XSS and Script Injection
async function testXSSInjection() {
  console.log(`\n${colors.bright}${colors.magenta}🦠 XSS & Script Injection Testing${colors.reset}`);
  
  const xssPayloads = [
    { name: 'Basic XSS', payload: '<script>alert("XSS")</script>' },
    { name: 'Image XSS', payload: '<img src=x onerror=alert("XSS")>' },
    { name: 'SVG XSS', payload: '<svg onload=alert("XSS")>' },
    { name: 'Event handler', payload: '<body onload=alert("XSS")>' },
    { name: 'JavaScript protocol', payload: 'javascript:alert("XSS")' },
    { name: 'Data URI', payload: 'data:text/html,<script>alert("XSS")</script>' },
    { name: 'Unicode bypass', payload: '\\u003cscript\\u003ealert(\\u0022XSS\\u0022)\\u003c/script\\u003e' },
    { name: 'Polyglot payload', payload: 'jaVasCript:alert("XSS")' }
  ];
  
  for (const test of xssPayloads) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    const result = await trpcCall('createVault', {
      tokenAddress: '0x' + '1'.repeat(40),
      tokenSymbol: test.payload,
      ownerAddress: '0x' + '2'.repeat(40),
      ledgerAddress: '0x' + '3'.repeat(40)
    });
    
    if (result.error) {
      console.log(`${colors.green}✅ Blocked: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else if (result.data && JSON.stringify(result.data).includes('script')) {
      console.log(`${colors.red}🚨 XSS PAYLOAD REFLECTED!${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Sanitized correctly${colors.reset}`);
    }
  }
}

// Test 4: Path Traversal and File Access
async function testPathTraversal() {
  console.log(`\n${colors.bright}${colors.magenta}📁 Path Traversal Testing${colors.reset}`);
  
  const pathTraversalPayloads = [
    { name: 'Basic traversal', path: '../../../etc/passwd' },
    { name: 'URL encoded', path: '..%2f..%2f..%2fetc%2fpasswd' },
    { name: 'Double encoding', path: '..%252f..%252f..%252fetc%252fpasswd' },
    { name: 'Unicode bypass', path: '..\\u2215..\\u2215..\\u2215etc\\u2215passwd' },
    { name: 'Null byte', path: '../../../etc/passwd\\x00' },
    { name: 'Absolute path', path: '/etc/passwd' },
    { name: 'Windows path', path: '..\\..\\..\\windows\\system32\\config\\sam' },
    { name: 'Mixed separators', path: '..\\../..\\../etc/passwd' }
  ];
  
  for (const test of pathTraversalPayloads) {
    console.log(`${colors.cyan}🔍 Testing: ${test.name}${colors.reset}`);
    
    const result = await trpcCall('getVaults', {
      limit: 10,
      search: test.path
    });
    
    if (result.error && result.error.message.includes('permission')) {
      console.log(`${colors.green}✅ Permission denied: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else if (result.error) {
      console.log(`${colors.green}✅ Blocked: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Sanitized correctly${colors.reset}`);
    }
  }
}

// Test 5: Rate Limiting Bypass
async function testRateLimiting() {
  console.log(`\n${colors.bright}${colors.magenta}⚡ Rate Limiting Bypass Testing${colors.reset}`);
  
  console.log(`${colors.cyan}🔍 Testing: Rapid sequential requests${colors.reset}`);
  
  const requests = [];
  const startTime = Date.now();
  
  // Invia 50 richieste rapidamente
  for (let i = 0; i < 50; i++) {
    requests.push(
      trpcCall('getDashboardStats').then(result => ({
        success: !result.error,
        rateLimited: result.status === 429,
        timestamp: Date.now()
      }))
    );
  }
  
  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;
  const rateLimitedCount = results.filter(r => r.rateLimited).length;
  const successCount = results.filter(r => r.success).length;
  
  console.log(`${colors.gray}  Duration: ${duration}ms${colors.reset}`);
  console.log(`${colors.gray}  Rate limited: ${rateLimitedCount}/50${colors.reset}`);
  console.log(`${colors.gray}  Success: ${successCount}/50${colors.reset}`);
  
  if (rateLimitedCount > 0) {
    console.log(`${colors.green}✅ Rate limiting active${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  No rate limiting detected${colors.reset}`);
  }
  
  // Test con differenti IP headers
  console.log(`${colors.cyan}🔍 Testing: IP spoofing attempts${colors.reset}`);
  
  const ipHeaders = [
    { name: 'X-Forwarded-For', value: '1.1.1.1' },
    { name: 'X-Real-IP', value: '8.8.8.8' },
    { name: 'CF-Connecting-IP', value: '9.9.9.9' },
    { name: 'X-Client-IP', value: '123.123.123.123' }
  ];
  
  for (const header of ipHeaders) {
    console.log(`${colors.gray}  Testing ${header.name}: ${header.value}${colors.reset}`);
    
    try {
      const response = await fetch(`${API_BASE}/getDashboardStats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          [header.name]: header.value
        }
      });
      
      console.log(`${colors.gray}    Response: ${response.status}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.gray}    Error: ${error.message}${colors.reset}`);
    }
  }
}

// Test 6: Business Logic Bypass
async function testBusinessLogicBypass() {
  console.log(`\n${colors.bright}${colors.magenta}💼 Business Logic Bypass Testing${colors.reset}`);
  
  // Test di bypass per le fee
  console.log(`${colors.cyan}🔍 Testing: Fee bypass attempts${colors.reset}`);
  
  const feeBypassTests = [
    { name: 'Zero fee', amount: '0' },
    { name: 'Negative fee', amount: '-1000' },
    { name: 'Very small fee', amount: '1' },
    { name: 'Decimal overflow', amount: '0.000000000000000001' },
    { name: 'Large number bypass', amount: '999999999999999999999999999999' }
  ];
  
  for (const test of feeBypassTests) {
    console.log(`${colors.gray}  Testing: ${test.name} (${test.amount})${colors.reset}`);
    
    const result = await trpcCall('createDeposit', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amount: test.amount
    });
    
    if (result.error) {
      console.log(`${colors.green}    ✅ Blocked: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}    ⚠️  Accepted: Potential bypass${colors.reset}`);
    }
  }
}

// Test 7: Cryptographic Weaknesses
async function testCryptographicWeaknesses() {
  console.log(`\n${colors.bright}${colors.magenta}🔐 Cryptographic Weaknesses Testing${colors.reset}`);
  
  // Test firme deboli
  console.log(`${colors.cyan}🔍 Testing: Weak signatures${colors.reset}`);
  
  const weakSignatures = [
    { name: 'All zeros', signature: '0x' + '0'.repeat(64) },
    { name: 'All ones', signature: '0x' + 'f'.repeat(64) },
    { name: 'Short signature', signature: '0x' + '1'.repeat(32) },
    { name: 'Long signature', signature: '0x' + '1'.repeat(128) },
    { name: 'Invalid hex', signature: '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG' },
    { name: 'Null signature', signature: '' },
    { name: 'Same signature reuse', signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' }
  ];
  
  for (const test of weakSignatures) {
    console.log(`${colors.gray}  Testing: ${test.name}${colors.reset}`);
    
    const result = await trpcCall('requestWithdrawCapital', {
      userAddress: '0x' + '1'.repeat(40),
      vaultId: 1,
      amountDecimal: '100',
      signature: test.signature,
      deadline: Math.floor(Date.now() / 1000) + 3600
    });
    
    if (result.error) {
      console.log(`${colors.green}    ✅ Rejected: ${result.error.message.substring(0, 100)}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}    ⚠️  Accepted: Weak signature accepted${colors.reset}`);
    }
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}🛡️  TRuDe API Security & Vulnerability Testing${colors.reset}`);
  console.log(`${colors.gray}==========================================${colors.reset}`);
  
  await testAuthenticationBypass();
  await testSQLInjection();
  await testXSSInjection();
  await testPathTraversal();
  await testRateLimiting();
  await testBusinessLogicBypass();
  await testCryptographicWeaknesses();
  
  console.log(`\n${colors.bright}${colors.green}✅ Security testing completed!${colors.reset}\n`);
}

main().catch(console.error);