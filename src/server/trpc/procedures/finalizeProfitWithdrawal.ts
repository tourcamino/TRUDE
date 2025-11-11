import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const finalizeProfitWithdrawal = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      profitId: z.number(),
      txHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/, "Invalid transaction hash"),
    })
  )
  .mutation(async ({ input }) => {
    const profit = await db.profit.findUnique({
      where: { id: input.profitId },
      include: { user: true, vault: true },
    });

    if (!profit) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profit record not found" });
    }

    if (profit.user.address.toLowerCase() !== input.userAddress.toLowerCase()) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only finalize your own profits" });
    }

    if (profit.withdrawn) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This profit has already been withdrawn" });
    }

    // Mark as withdrawn
    const updatedProfit = await db.profit.update({
      where: { id: profit.id },
      data: { withdrawn: true },
    });

    // Update vault TVL: subtract withdrawn profit
    const vault = await db.vault.findUnique({ where: { id: profit.vault.id } });
    if (vault) {
      const tvl = BigInt(vault.totalValueLocked);
      const delta = BigInt(profit.amount);
      const newTVL = tvl >= delta ? tvl - delta : 0n;
      await db.vault.update({ where: { id: vault.id }, data: { totalValueLocked: newTVL.toString() } });
    }

    // Audit log with tx hash
    await db.auditLog.create({
      data: {
        action: "WITHDRAW_PROFIT_EXECUTED",
        status: "EXECUTED",
        userId: profit.user.id,
        vaultId: profit.vault.id,
        details: { profitId: profit.id, amount: profit.amount, txHash: input.txHash },
      },
    });

    return {
      success: true,
      profit: updatedProfit,
      txHash: input.txHash,
    };
  });