import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

// Finalize a capital withdrawal request after on-chain execution
// Marks the request as EXECUTED, records txHash, creates CapitalWithdrawal entry, and updates Vault TVL
export const finalizeWithdrawCapital = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      requestId: z.number(),
      txHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/, "Invalid transaction hash"),
    })
  )
  .mutation(async ({ input }) => {
    const request = await db.withdrawalRequest.findUnique({
      where: { id: input.requestId },
      include: { user: true, vault: true },
    });

    if (!request) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal request not found" });
    }

    if (request.user.address.toLowerCase() !== input.userAddress.toLowerCase()) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only finalize your own requests" });
    }

    if (request.status === "EXECUTED") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This request has already been executed" });
    }

    // Create capital withdrawal record
    const withdrawal = await db.capitalWithdrawal.create({
      data: {
        userId: request.user.id,
        vaultId: request.vault.id,
        amount: request.amount,
      },
    });

    // Update vault TVL: subtract withdrawn capital
    const vault = await db.vault.findUnique({ where: { id: request.vault.id } });
    if (vault) {
      const tvl = BigInt(vault.totalValueLocked);
      const delta = BigInt(request.amount);
      const newTVL = tvl >= delta ? tvl - delta : 0n;
      await db.vault.update({ where: { id: vault.id }, data: { totalValueLocked: newTVL.toString() } });
    }

    // Mark request as executed and store txHash
    const executed = await db.withdrawalRequest.update({
      where: { id: request.id },
      data: { status: "EXECUTED", onChain: true, txHash: input.txHash },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "WITHDRAW_CAPITAL_EXECUTED",
        status: "EXECUTED",
        userId: request.user.id,
        vaultId: request.vault.id,
        requestId: request.id,
        details: { amount: request.amount, txHash: input.txHash },
      },
    });

    return { success: true, request: executed, withdrawal, txHash: input.txHash };
  });