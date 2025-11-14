#!/usr/bin/env node

/**
 * TRuDe API Complete Testing Suite Runner
 * Esegue tutti i test delle API TRuDe in sequenza
 */

import { spawn } from 'child_process';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const tests = [
  { name: 'Basic API Tests', file: 'test-trude-api.js' },
  { name: 'Edge Cases', file: 'test-edge-cases.js' },
  { name: 'Stress & Load', file: 'test-stress-load.js' },
  { name: 'Security Testing', file: 'test-security.js' },
  { name: 'Smart Contracts', file: 'test-smart-contracts.js' }
];

async function runTest(test) {
  console.log(`\n${colors.bright}${colors.blue}🧪 Running: ${test.name}${colors.reset}`);
  console.log(`${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  return new Promise((resolve) => {
    const child = spawn('node', [test.file], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✅ ${test.name} completed successfully${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${test.name} failed with code ${code}${colors.reset}`);
      }
      resolve(code);
    });
  });
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}🚀 TRuDe API Complete Testing Suite${colors.reset}`);
  console.log(`${colors.gray}====================================${colors.reset}`);
  console.log(`${colors.yellow}Starting comprehensive API testing...${colors.reset}`);
  
  const startTime = Date.now();
  let totalFailures = 0;
  
  for (const test of tests) {
    const code = await runTest(test);
    if (code !== 0) totalFailures++;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n${colors.bright}${colors.cyan}📊 Testing Summary${colors.reset}`);
  console.log(`${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}Total Tests Run: ${tests.length}${colors.reset}`);
  console.log(`${colors.green}Successful: ${tests.length - totalFailures}${colors.reset}`);
  console.log(`${totalFailures > 0 ? colors.red : colors.green}Failed: ${totalFailures}${colors.reset}`);
  console.log(`${colors.blue}Total Duration: ${duration}s${colors.reset}`);
  
  if (totalFailures === 0) {
    console.log(`\n${colors.bright}${colors.green}🎉 All tests passed! TRuDe API is ready for production.${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}⚠️  Some tests failed. Please review the output above.${colors.reset}`);
  }
  
  console.log(`\n${colors.gray}For detailed results, see TESTING-REPORT.md${colors.reset}`);
}

main().catch(console.error);