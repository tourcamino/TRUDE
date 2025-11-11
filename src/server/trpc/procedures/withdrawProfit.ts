import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { buildWithdrawProfitCalldata } from "~/server/utils/onchain";

export const withdrawProfit = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      profitId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Find the profit record
    const profit = await db.profit.findUnique({
      where: { id: input.profitId },
      include: {
        user: true,
        vault: true,
      },
    });

    if (!profit) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profit record not found",
      });
    }

    // Verify the profit belongs to the requesting user
    if (profit.user.address !== input.userAddress) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only withdraw your own profits",
      });
    }

    // Check if already withdrawn
    if (profit.withdrawn) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This profit has already been withdrawn",
      });
    }

    // Customer flow: allow profit withdrawal anytime; client pays gas on-chain.

    // Log request audit (optional)
    await db.auditLog.create({
      data: {
        action: "REQUEST_WITHDRAW_PROFIT",
        status: "PENDING",
        userId: profit.user.id,
        vaultId: profit.vault.id,
        details: { profitId: profit.id, amount: profit.amount, userAddress: input.userAddress },
      },
    });

    // Return prepared transaction for client-side broadcast (gas paid by client)
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const preparedTx = {
      to: profit.vault.address,
      data: buildWithdrawProfitCalldata(BigInt(profit.amount)),
      value: "0x0",
      chainId,
    } as const;

    return {
      success: true,
      profit: { id: profit.id, amount: profit.amount, withdrawn: false },
      preparedTx,
    };
  });
