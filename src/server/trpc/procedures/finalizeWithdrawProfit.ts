import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const finalizeWithdrawProfit = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      profitId: z.number(),
      txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    })
  )
  .mutation(async ({ input }) => {
    const profit = await db.profit.findUnique({ where: { id: input.profitId }, include: { user: true, vault: true } });
    if (!profit) throw new TRPCError({ code: "NOT_FOUND", message: "Profit not found" });
    if (profit.user.address !== input.userAddress) throw new TRPCError({ code: "FORBIDDEN", message: "Invalid user" });
    if (profit.withdrawn) throw new TRPCError({ code: "BAD_REQUEST", message: "Already withdrawn" });
    await db.profit.update({ where: { id: profit.id }, data: { withdrawn: true } });
    const newTVL = (BigInt(profit.vault.totalValueLocked) - BigInt(profit.amount)).toString();
    await db.vault.update({ where: { id: profit.vault.id }, data: { totalValueLocked: newTVL } });
    await db.auditLog.create({ data: { action: "FINALIZE_WITHDRAW_PROFIT", status: "EXECUTED", userId: profit.user.id, vaultId: profit.vault.id, details: { txHash: input.txHash, profitId: profit.id } } });
    return { success: true };
  });
