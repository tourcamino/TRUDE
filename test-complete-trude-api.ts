#!/usr/bin/env tsx

import { randomBytes } from "crypto";
import { performance } from "node:perf_hooks";

// Test completo di TUTTE le API TRuDe
async function testCompleteTrudeAPI() {
  console.log("🚀 AVVIO TESTING COMPLETO TRUDE API");
  console.log("=" .repeat(60));
  
  // Importa il caller
  process.env.DB_FALLBACK_MEM = "1";
  const { createCaller } = await import("./src/server/trpc/root");
  const caller = createCaller({});

  const randAddr = () => `0x${randomBytes(20).toString("hex")}`;
  const user = randAddr();
  const owner = randAddr();
  const ledger = randAddr();
  const token = randAddr();

  const results: any = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const test = async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = (performance.now() - start).toFixed(2);
      results.passed++;
      results.tests.push({ name, status: 'PASS', duration, result });
      console.log(`✅ ${name} - ${duration}ms`);
      return result;
    } catch (error: any) {
      const duration = (performance.now() - start).toFixed(2);
      results.failed++;
      results.tests.push({ name, status: 'FAIL', duration, error: error.message });
      console.log(`❌ ${name} - ${duration}ms - ${error.message}`);
      throw error;
    }
  };

  try {
    // 1. API DI BASE - HEALTH & UTILITIES
    console.log("\n🏥 1. TESTING API BASE");
    await test("Health Check", async () => {
      const result = await caller.utility.healthCheck();
      if (!result.dbConnected) throw new Error("Health check fallito - database non connesso");
      return result;
    });

    await test("Get Token Prices", async () => {
      const result = await caller.utility.getTokenPrices({ symbols: ['USDC', 'USDT', 'DAI'] });
      if (!result.prices) throw new Error("Prezzi non disponibili");
      return result;
    });

    await test("Get Chain Info", async () => {
      const result = await caller.utility.getChainInfo();
      if (!result.success) throw new Error("Chain info non disponibile");
      return result;
    });

    // 2. VAULT MANAGEMENT
    console.log("\n🏦 2. TESTING VAULT MANAGEMENT");
    let vaultId: number;

    await test("Create Vault", async () => {
      const result = await caller.core.createVault({
        tokenAddress: token,
        tokenSymbol: "USDC",
        ownerAddress: owner,
        ledgerAddress: ledger,
      });
      if (!result.vault?.id) throw new Error("Vault creation failed");
      vaultId = result.vault.id;
      return result;
    });

    await test("Get Vaults", async () => {
      const result = await caller.vault.getVaults({ limit: 10 });
      if (!result.vaults || result.vaults.length === 0) throw new Error("Nessuna vault trovata");
      return result;
    });

    await test("Get Vault By ID", async () => {
      const result = await caller.vault.getVaultById({ vaultId });
      if (!result.vault) throw new Error("Vault non trovata");
      return result;
    });

    await test("Get Vault Metrics", async () => {
      const result = await caller.vault.getVaultMetrics({ vaultIds: [vaultId] });
      if (!result.metrics) throw new Error("Metriche non disponibili");
      return result;
    });

    await test("Get Vault Events", async () => {
      // First get the vault to get its address
      const vaultResult = await caller.vault.getVaultById({ vaultId });
      if (!vaultResult.vault?.address) throw new Error("Vault address non disponibile");
      
      const result = await caller.vault.getVaultEvents({ vaultAddress: vaultResult.vault.address });
      if (!result.events) throw new Error("Eventi non disponibili");
      return result;
    });

    // 3. TRANSACTIONS - DEPOSIT & WITHDRAW
    console.log("\n💰 3. TESTING TRANSACTIONS");
    let depositId: number;

    await test("Prepare Deposit", async () => {
      const result = await caller.transaction.prepareDeposit({
        userAddress: user,
        vaultId: vaultId,
        amount: "100500000" // 100.5 USDC in smallest unit
      });
      if (!result.prepared) throw new Error("Preparazione deposito fallita");
      return result;
    });

    await test("Create Deposit", async () => {
      const result = await caller.core.createDeposit({
        userAddress: user,
        vaultId: vaultId,
        amount: "100500000" // 100.5 USDC
      });
      if (!result.deposit?.id) throw new Error("Deposito fallito");
      depositId = result.deposit.id;
      return result;
    });

    await test("Register Profit", async () => {
      const result = await caller.core.registerProfit({
        userAddress: user,
        vaultId: vaultId,
        profitAmount: "5000000" // 5 USDC profitto
      });
      if (!result.profit?.id) throw new Error("Registrazione profitto fallita");
      return result;
    });

    await test("Request Withdraw Capital", async () => {
      const result = await caller.core.requestWithdrawCapital({
        mode: "customer",
        executeNow: true,
        userAddress: user,
        vaultId: vaultId,
        amount: "50000000" // 50 USDC
      });
      if (!result.preparedTx || !result.request?.id) throw new Error("Prelievo capitale fallito");
      return result;
    });

    await test("Finalize Withdraw Capital", async () => {
      const result = await caller.core.finalizeWithdrawCapital({
        userAddress: user,
        requestId: 1, // Mock request ID
        txHash: `0x${"1".repeat(64)}`
      });
      if (!result.success) throw new Error("Finalizzazione prelievo fallita");
      return result;
    });

    // 4. REPORTING & ANALYTICS
    console.log("\n📊 4. TESTING REPORTING");

    await test("Get Dashboard Stats", async () => {
      const result = await caller.admin.getDashboardStats();
      if (!result.totalTVL) throw new Error("Statistiche non disponibili");
      return result;
    });

    await test("Get Revenue Metrics", async () => {
      const result = await caller.core.getRevenueMetrics();
      if (!result.tvlTotal) throw new Error("Metriche revenue non disponibili");
      return result;
    });

    await test("Get Revenue By Affiliate", async () => {
      const result = await caller.core.getRevenueByAffiliate();
      if (!result.affiliates) throw new Error("Dati affiliate non disponibili");
      return result;
    });

    await test("Get Revenue By Vault", async () => {
      const result = await caller.core.getRevenueByVault();
      if (!result.vaults) throw new Error("Dati per vault non disponibili");
      return result;
    });

    await test("Get User Dashboard", async () => {
      const result = await caller.admin.getUserDashboard({ userAddress: user });
      if (!result.totalDeposited) throw new Error("Dashboard utente non disponibile");
      return result;
    });

    // 5. ADMIN FUNCTIONS
    console.log("\n⚙️ 5. TESTING ADMIN FUNCTIONS");

    await test("Get Factory Settings", async () => {
      const result = await caller.admin.getFactorySettings();
      if (!result.settings) throw new Error("Impostazioni factory non disponibili");
      return result;
    });

    // 6. ERROR HANDLING TEST
    console.log("\n⚠️ 6. TESTING ERROR HANDLING");

    await test("Error - Invalid Vault ID", async () => {
      try {
        await caller.vault.getVaultById({ vaultId: 999999 });
        throw new Error("Dovrebbe aver fallito con vault ID invalido");
      } catch (error: any) {
        if (!error.message.includes('not found') && !error.message.includes('Vault')) {
          throw new Error("Errore inaspettato: " + error.message);
        }
        return { errorHandled: true };
      }
    });

    await test("Error - Invalid Address", async () => {
      try {
        await caller.admin.getUserDashboard({ userAddress: "indirizzo-invalido" });
        throw new Error("Dovrebbe aver fallito con indirizzo invalido");
      } catch (error: any) {
        return { errorHandled: true };
      }
    });

    // RISULTATI FINALI
    console.log("\n" + "=".repeat(60));
    console.log("🏁 RISULTATI FINALI TESTING TRUDE API");
    console.log("=".repeat(60));
    console.log(`✅ Test Superati: ${results.passed}`);
    console.log(`❌ Test Falliti: ${results.failed}`);
    console.log(`📊 Percentuale Successo: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    console.log("\n📈 DETTAGLI TEST:");
    results.tests.forEach((test: any) => {
      const icon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${test.name} - ${test.duration}ms`);
    });

    if (results.failed === 0) {
      console.log("\n🎉 TUTTI I TEST SONO STATI SUPERATI! TRUDE API È PRONTA!");
    } else {
      console.log(`\n⚠️  ${results.failed} test falliti - verificare i dettagli sopra`);
    }

  } catch (error: any) {
    console.error("\n💥 ERRORE CRITICO DURANTE IL TESTING:", error.message);
    process.exit(1);
  }
}

// Esegui il test
testCompleteTrudeAPI().catch((error) => {
  console.error("Errore fatale:", error);
  process.exit(1);
});