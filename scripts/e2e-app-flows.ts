import { randomBytes } from "crypto";
import { performance } from "node:perf_hooks";
// defer createCaller import until after env is set

async function run() {
  process.env.DB_FALLBACK_MEM = "1";
  const { createCaller } = await import("../src/server/trpc/root-e2e.ts");
  const caller = createCaller({});

  const randAddr = () => `0x${randomBytes(20).toString("hex")}`;
  const user = randAddr();
  const owner = randAddr();
  const ledger = randAddr();
  const token = randAddr();

  const times: Record<string, number> = {};
  const time = (label: string, start?: number) => {
    if (start === undefined) {
      return performance.now();
    }
    const end = performance.now();
    const ms = +(end - start).toFixed(2);
    times[label] = ms;
    return ms;
  };

  console.log("Creating vault...");
  const t0Create = time("createVault");
  const { vault } = await caller.createVault({
    tokenAddress: token,
    tokenSymbol: "USDC",
    ownerAddress: owner,
    ledgerAddress: ledger,
  });
  time("createVault", t0Create);
  if (!vault?.id || !vault?.address) throw new Error("Vault creation failed");
  console.log("Vault created:", vault.id, vault.address, `${times.createVault}ms`);

  const depositAmount = "25000000";
  console.log("Depositing:", depositAmount, "(smallest units)");
  const t0Deposit = time("createDeposit");
  const { deposit } = await caller.createDeposit({
    userAddress: user,
    vaultId: vault.id,
    amount: depositAmount,
  });
  time("createDeposit", t0Deposit);
  if (!deposit?.id) throw new Error("Deposit failed");
  console.log("Deposit OK:", deposit.id, `${times.createDeposit}ms`);

  const profitAmount = "5000000";
  console.log("Register profit:", profitAmount);
  const t0Profit = time("registerProfit");
  const { profit } = await caller.registerProfit({
    userAddress: user,
    vaultId: vault.id,
    profitAmount,
  });
  time("registerProfit", t0Profit);
  if (!profit?.id) throw new Error("Profit registration failed");
  console.log("Profit OK:", profit.id, `${times.registerProfit}ms`);

  console.log("Request Withdraw Capital (customer mode)...");
  const t0Req = time("requestWithdrawCapital");
  const { preparedTx, request } = await caller.requestWithdrawCapital({
    mode: "customer",
    executeNow: true,
    userAddress: user,
    vaultId: vault.id,
    amount: depositAmount,
  });
  time("requestWithdrawCapital", t0Req);
  if (!preparedTx || !request?.id) throw new Error("Withdraw request failed");
  console.log("PreparedTx:", preparedTx, `${times.requestWithdrawCapital}ms`);

  const dummyTxHash = `0x${"1".repeat(64)}`;
  console.log("Finalize Withdraw Capital with txHash:", dummyTxHash);
  const t0Fin = time("finalizeWithdrawCapital");
  const finalized = await caller.finalizeWithdrawCapital({
    userAddress: user,
    requestId: request.id,
    txHash: dummyTxHash,
  });
  time("finalizeWithdrawCapital", t0Fin);
  if (!finalized?.success) throw new Error("Finalize withdraw failed");
  console.log("Withdraw Capital finalized:", finalized.success, finalized.txHash, `${times.finalizeWithdrawCapital}ms`);

  console.log("All flows OK: deposit, register profit, withdraw capital.");
  console.table(times);

  const metrics = await caller.getRevenueMetrics();
  console.log("Revenue metrics:", metrics);
  const byAff = await caller.getRevenueByAffiliate();
  console.log("Revenue by affiliate:", byAff);
  const byVault = await caller.getRevenueByVault();
  console.log("Revenue by vault:", byVault);
}

run().catch((err) => {
  console.error("E2E failed:", err);
  process.exitCode = 1;
});