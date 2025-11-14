import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { JsonRpcProvider, Interface } from "ethers";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const vaultArtifact = require("../../../../artifacts/contracts/TrudeVault.sol/TrudeVault.json");
import { db } from "~/server/db";

const iface = new Interface((vaultArtifact as any).abi);

export const syncVaultEvents = baseProcedure
  .input(z.object({ vaultId: z.number(), fromBlock: z.number().int().nonnegative().optional(), toBlock: z.number().int().nonnegative().optional() }))
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) return { success: false };
    const provider = new JsonRpcProvider(env.CHAIN_RPC_URL || "http://127.0.0.1:8545");
    const latest = await provider.getBlockNumber();
    const from = input.fromBlock ?? Math.max(0, latest - 5000);
    const to = input.toBlock ?? latest;
    const logs = await provider.getLogs({ address: vault.address, fromBlock: from, toBlock: to });
    for (const log of logs) {
      try {
        const parsed = iface.parseLog(log);
        const name = parsed?.name;
        const args = parsed?.args as any;
        if (name === "TVLUpdated") {
          const newTVL = args?.[0]?.toString?.() ?? null;
          if (newTVL) await db.vault.update({ where: { id: vault.id }, data: { totalValueLocked: newTVL } });
        } else if (name === "Deposit") {
          const userAddr: string = args?.user ?? args?.[0];
          const amountStr: string = (args?.amount ?? args?.[1])?.toString?.() ?? "0";
          let user = await db.user.findUnique({ where: { address: userAddr } });
          if (!user) user = await db.user.create({ data: { address: userAddr } });
          const exists = await db.deposit.findFirst({ where: { txHash: log.transactionHash } });
          if (!exists) {
            await db.deposit.create({ data: { userId: user.id, vaultId: vault.id, amount: amountStr, txHash: log.transactionHash } });
          }
        } else if (name === "Withdraw") {
          const userAddr: string = args?.user ?? args?.[0];
          const amountStr: string = (args?.amount ?? args?.[1])?.toString?.() ?? "0";
          let user = await db.user.findUnique({ where: { address: userAddr } });
          if (user) {
            const profit = await db.profit.findFirst({ where: { userId: user.id, vaultId: vault.id, withdrawn: false }, orderBy: { id: "asc" } });
            if (profit) {
              await db.profit.update({ where: { id: profit.id }, data: { withdrawn: true, withdrawTxHash: log.transactionHash } });
            }
          }
        } else if (name === "ProfitRegistered") {
          const userAddr: string = args?.user ?? args?.[0];
          const amountStr: string = (args?.amount ?? args?.[1])?.toString?.() ?? "0";
          let user = await db.user.findUnique({ where: { address: userAddr } });
          if (!user) user = await db.user.create({ data: { address: userAddr } });
          await db.profit.create({ data: { userId: user.id, vaultId: vault.id, amount: amountStr } });
        } else if (name === "CapitalWithdraw") {
          const userAddr: string = args?.user ?? args?.[0];
          const amountStr: string = (args?.amount ?? args?.[1])?.toString?.() ?? "0";
          let user = await db.user.findUnique({ where: { address: userAddr } });
          if (!user) user = await db.user.create({ data: { address: userAddr } });
          const exists = await db.capitalWithdrawal.findFirst({ where: { txHash: log.transactionHash } });
          if (!exists) {
            await db.capitalWithdrawal.create({ data: { userId: user.id, vaultId: vault.id, amount: amountStr, txHash: log.transactionHash } });
          }
        }
      } catch {
        // ignore
      }
    }
    return { success: true, fromBlock: from, toBlock: to };
  });
