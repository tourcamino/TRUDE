import { randomBytes } from "crypto";
import { createCaller } from "../src/server/trpc/root.ts";

async function run() {
  const caller = createCaller({});

  const randAddr = () => `0x${randomBytes(20).toString("hex")}`;
  const user = randAddr();
  const owner = randAddr();
  const ledger = randAddr();
  const token = randAddr();

  console.log("Creating vault...");
  const { vault } = await caller.createVault({
    tokenAddress: token,
    tokenSymbol: "USDC",
    ownerAddress: owner,
    ledgerAddress: ledger,
  });
  console.log("Vault created:", vault.id, vault.address);

  // Deposit: minDeposit defaults to 10 USDC (6 decimals) => 10_000_000
  const depositAmount = "25000000"; // 25 USDC in 6 decimals
  console.log("Depositing:", depositAmount, "(smallest units)");
  const { deposit } = await caller.createDeposit({
    userAddress: user,
    vaultId: vault.id,
    amount: depositAmount,
  });
  console.log("Deposit OK:", deposit.id);

  // Register profit: 5 USDC
  const profitAmount = "5000000";
  console.log("Register profit:", profitAmount);
  const { profit } = await caller.registerProfit({
    userAddress: user,
    vaultId: vault.id,
    profitAmount,
  });
  console.log("Profit OK:", profit.id);

  // Withdraw Capital: request prepared tx for full available principal
  // Available should be equal to depositAmount at this point
  console.log("Request Withdraw Capital (customer mode)...");
  const { preparedTx, request } = await caller.requestWithdrawCapital({
    mode: "customer",
    executeNow: true,
    userAddress: user,
    vaultId: vault.id,
    amount: depositAmount,
  });
  console.log("PreparedTx:", preparedTx);

  // Finalize with dummy txHash (simulate wallet send)
  const dummyTxHash = `0x${"1".repeat(64)}`;
  console.log("Finalize Withdraw Capital with txHash:", dummyTxHash);
  const finalized = await caller.finalizeWithdrawCapital({
    userAddress: user,
    requestId: request.id,
    txHash: dummyTxHash,
  });
  console.log("Withdraw Capital finalized:", finalized.success, finalized.txHash);

  console.log("All flows OK: deposit, register profit, withdraw capital.");
}

run().catch((err) => {
  console.error("E2E failed:", err);
  process.exitCode = 1;
});