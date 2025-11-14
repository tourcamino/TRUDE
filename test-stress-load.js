#!/usr/bin/env node

/**
 * TRuDe API Stress & Load Testing
 * Test di carico e stress per verificare i limiti del sistema
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

// Test 1: Stress Test Progressivo
async function progressiveStressTest() {
  console.log(`${colors.bright}${colors.magenta}📈 Progressive Stress Test${colors.reset}`);
  
  const levels = [
    { name: 'Light', requests: 10, concurrent: 2 },
    { name: 'Medium', requests: 50, concurrent: 5 },
    { name: 'Heavy', requests: 100, concurrent: 10 },
    { name: 'Extreme', requests: 200, concurrent: 20 },
    { name: 'Insane', requests: 500, concurrent: 50 }
  ];
  
  for (const level of levels) {
    console.log(`\n${colors.cyan}🔥 ${level.name} Load: ${level.requests} requests, ${level.concurrent} concurrent${colors.reset}`);
    
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const latencies = [];
    
    // Esegui richieste in batch
    for (let batch = 0; batch < Math.ceil(level.requests / level.concurrent); batch++) {
      const batchStart = Date.now();
      const batchPromises = [];
      
      // Crea batch di richieste concorrenti
      for (let i = 0; i < level.concurrent && (batch * level.concurrent + i) < level.requests; i++) {
        batchPromises.push(
          trpcCall('getVaults', { limit: 1 }).then(result => {
            const latency = Date.now() - batchStart;
            latencies.push(latency);
            
            if (result.error) {
              errorCount++;
            } else {
              successCount++;
            }
            return result;
          })
        );
      }
      
      await Promise.allSettled(batchPromises);
      
      // Piccola pausa tra i batch
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalTime = Date.now() - startTime;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);
    
    console.log(`${colors.gray}  Total time: ${totalTime}ms${colors.reset}`);
    console.log(`${colors.gray}  Success: ${successCount}/${level.requests}${colors.reset}`);
    console.log(`${colors.gray}  Errors: ${errorCount}${colors.reset}`);
    console.log(`${colors.gray}  Avg latency: ${avgLatency.toFixed(2)}ms${colors.reset}`);
    console.log(`${colors.gray}  Min/Max: ${minLatency}ms / ${maxLatency}ms${colors.reset}`);
    
    if (errorCount > level.requests * 0.1) {
      console.log(`${colors.yellow}⚠️  High error rate detected!${colors.reset}`);
      break;
    }
  }
}

// Test 2: Sustained Load Test
async function sustainedLoadTest() {
  console.log(`\n${colors.bright}${colors.magenta}⏱️  Sustained Load Test (30 seconds)${colors.reset}`);
  
  const duration = 30000; // 30 secondi
  const targetRPS = 10; // Richieste per secondo
  const interval = 1000 / targetRPS;
  
  let requestCount = 0;
  let successCount = 0;
  let errorCount = 0;
  const latencies = [];
  
  const startTime = Date.now();
  
  console.log(`${colors.cyan}🎯 Target: ${targetRPS} RPS for ${duration/1000}s${colors.reset}`);
  
  while (Date.now() - startTime < duration) {
    const requestStart = Date.now();
    
    trpcCall('getDashboardStats').then(result => {
      const latency = Date.now() - requestStart;
      latencies.push(latency);
      
      if (result.error) {
        errorCount++;
      } else {
        successCount++;
      }
    }).catch(() => {
      errorCount++;
    });
    
    requestCount++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  // Attendi che tutte le richieste terminino
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const actualDuration = Date.now() - startTime;
  const actualRPS = (requestCount / actualDuration) * 1000;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  
  console.log(`${colors.gray}  Requests sent: ${requestCount}${colors.reset}`);
  console.log(`${colors.gray}  Actual RPS: ${actualRPS.toFixed(2)}${colors.reset}`);
  console.log(`${colors.gray}  Success rate: ${((successCount/requestCount)*100).toFixed(2)}%${colors.reset}`);
  console.log(`${colors.gray}  Avg latency: ${avgLatency.toFixed(2)}ms${colors.reset}`);
}

// Test 3: Spike Test
async function spikeTest() {
  console.log(`\n${colors.bright}${colors.magenta}⚡ Spike Test${colors.reset}`);
  
  console.log(`${colors.cyan}📊 Normal load for 5 seconds...${colors.reset}`);
  let normalRequests = 0;
  let normalSuccess = 0;
  
  // Fase 1: Carico normale
  const normalStart = Date.now();
  while (Date.now() - normalStart < 5000) {
    trpcCall('getVaults', { limit: 1 }).then(result => {
      normalRequests++;
      if (!result.error) normalSuccess++;
    });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`${colors.gray}  Normal phase: ${normalSuccess}/${normalRequests} success${colors.reset}`);
  
  // Fase 2: Spike improvviso
  console.log(`${colors.cyan}🚀 Spike: 100 concurrent requests!${colors.reset}`);
  const spikeStart = Date.now();
  const spikePromises = [];
  
  for (let i = 0; i < 100; i++) {
    spikePromises.push(trpcCall('getRevenueMetrics', { rangeDays: 30 }));
  }
  
  const spikeResults = await Promise.allSettled(spikePromises);
  const spikeDuration = Date.now() - spikeStart;
  const spikeSuccess = spikeResults.filter(r => r.status === 'fulfilled' && !r.value.error).length;
  
  console.log(`${colors.gray}  Spike duration: ${spikeDuration}ms${colors.reset}`);
  console.log(`${colors.gray}  Spike success: ${spikeSuccess}/100${colors.reset}`);
  
  // Fase 3: Recupero
  console.log(`${colors.cyan}🔄 Recovery phase...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const recoveryResult = await trpcCall('getUserDashboard', { userAddress: '0x' + '1'.repeat(40) });
  console.log(`${colors.gray}  Recovery: ${recoveryResult.error ? 'Failed' : 'Success'}${colors.reset}`);
}

// Test 4: Memory Leak Detection
async function memoryLeakTest() {
  console.log(`\n${colors.bright}${colors.magenta}💾 Memory Leak Detection${colors.reset}`);
  
  const iterations = 100;
  const initialMemory = process.memoryUsage().heapUsed;
  
  console.log(`${colors.cyan}🔍 Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB${colors.reset}`);
  
  for (let i = 0; i < iterations; i++) {
    // Crea e distruggi oggetti grandi
    const largeObject = {
      data: Array.from({length: 1000}, (_, j) => ({
        id: j,
        value: Math.random().toString(36),
        timestamp: Date.now(),
        nested: { deep: { data: 'x'.repeat(100) } }
      }))
    };
    
    await trpcCall('getVaults', largeObject);
    
    if (i % 20 === 0) {
      const currentMemory = process.memoryUsage().heapUsed;
      console.log(`${colors.gray}  Iteration ${i}: ${(currentMemory / 1024 / 1024).toFixed(2)}MB${colors.reset}`);
    }
    
    // Forza garbage collection se disponibile
    if (global.gc) {
      global.gc();
    }
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryGrowth = finalMemory - initialMemory;
  
  console.log(`${colors.gray}  Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB${colors.reset}`);
  console.log(`${colors.gray}  Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB${colors.reset}`);
  
  if (memoryGrowth > 50 * 1024 * 1024) { // 50MB
    console.log(`${colors.yellow}⚠️  Potential memory leak detected!${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Memory usage stable${colors.reset}`);
  }
}

// Test 5: Resource Exhaustion
async function resourceExhaustionTest() {
  console.log(`\n${colors.bright}${colors.magenta}🔥 Resource Exhaustion Test${colors.reset}`);
  
  console.log(`${colors.cyan}🎯 Testing connection limits...${colors.reset}`);
  
  const connectionPromises = [];
  const startTime = Date.now();
  
  // Cerca di esaurire le connessioni
  for (let i = 0; i < 1000; i++) {
    connectionPromises.push(
      trpcCall('getDashboardStats').then(result => ({
        success: !result.error,
        timestamp: Date.now()
      }))
    );
    
    if (i % 100 === 0) {
      console.log(`${colors.gray}  Connections: ${i}${colors.reset}`);
    }
  }
  
  const results = await Promise.allSettled(connectionPromises);
  const duration = Date.now() - startTime;
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  
  console.log(`${colors.gray}  Total duration: ${duration}ms${colors.reset}`);
  console.log(`${colors.gray}  Successful connections: ${successCount}/1000${colors.reset}`);
  console.log(`${colors.gray}  Connection success rate: ${((successCount/1000)*100).toFixed(2)}%${colors.reset}`);
  
  if (successCount < 900) {
    console.log(`${colors.yellow}⚠️  Connection exhaustion detected${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Connection handling robust${colors.reset}`);
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}🚀 TRuDe API Stress & Load Testing${colors.reset}`);
  console.log(`${colors.gray}=====================================${colors.reset}`);
  
  await progressiveStressTest();
  await sustainedLoadTest();
  await spikeTest();
  await memoryLeakTest();
  await resourceExhaustionTest();
  
  console.log(`\n${colors.bright}${colors.green}✅ All stress tests completed!${colors.reset}\n`);
}

main().catch(console.error);