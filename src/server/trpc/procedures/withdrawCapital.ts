import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

// Withdraw principal (capital) for a user from a vault.
// Allowed even when vault is paused (matches on-chain behavior).
// Validates available principal = totalDeposits - totalWithdrawals per user & vault.
export const withdrawCapital = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      vaultId: z.number(),
      amount: z.string().regex(/^\d+$/, "Amount must be a valid number string"),
    })
  )
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    }

    const user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const requested = BigInt(input.amount);
    if (requested <= 0n) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Amount must be greater than zero" });
    }

    // Compute available principal for this user in this vault
  const deposits = await db.deposit.findMany({ where: { userId: user.id, vaultId: vault.id } });
  const withdrawals = await db.capitalWithdrawal.findMany({ where: { userId: user.id, vaultId: vault.id } });
  const totalDeposits = deposits.reduce((acc: bigint, d: { amount: string }) => acc + BigInt(d.amount), 0n);
  const totalWithdrawals = withdrawals.reduce((acc: bigint, w: { amount: string }) => acc + BigInt(w.amount), 0n);
    const available = totalDeposits - totalWithdrawals;

    if (requested > available) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient available principal" });
    }

    // Create withdrawal record
    const withdrawal = await db.capitalWithdrawal.create({
      data: {
        userId: user.id,
        vaultId: vault.id,
        amount: input.amount,
      },
    });

    // Update vault TVL (subtract capital)
    const tvl = BigInt(vault.totalValueLocked);
    const newTVL = tvl >= requested ? tvl - requested : 0n;
    await db.vault.update({ where: { id: vault.id }, data: { totalValueLocked: newTVL.toString() } });

    return { success: true, withdrawal };
  });