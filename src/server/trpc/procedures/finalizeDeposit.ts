import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const finalizeDeposit = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      vaultId: z.number(),
      amount: z.string().regex(/^\d+$/),
      txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    })
  )
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    let user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) user = await db.user.create({ data: { address: input.userAddress } });
    const deposit = await db.deposit.create({ data: { userId: user.id, vaultId: vault.id, amount: input.amount } });
    const newTVL = (BigInt(vault.totalValueLocked) + BigInt(input.amount)).toString();
    await db.vault.update({ where: { id: vault.id }, data: { totalValueLocked: newTVL } });
    await db.auditLog.create({ data: { action: "FINALIZE_DEPOSIT", status: "EXECUTED", userId: user.id, vaultId: vault.id, details: { txHash: input.txHash, depositId: deposit.id } } });
    return { success: true, depositId: deposit.id };
  });
