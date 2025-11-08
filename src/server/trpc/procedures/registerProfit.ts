import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const registerProfit = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      vaultId: z.number(),
      profitAmount: z.string().regex(/^\d+$/, "Amount must be a valid number string"),
    })
  )
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({
      where: { id: input.vaultId },
    });

    if (!vault) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vault not found",
      });
    }

    // Allow profit registration for any token vault; rely on paused/admin flows

    const user = await db.user.findUnique({
      where: { address: input.userAddress },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Create profit record
    const profit = await db.profit.create({
      data: {
        userId: user.id,
        vaultId: vault.id,
        amount: input.profitAmount,
        withdrawn: false,
      },
    });

    // Update vault TVL
    const newTVL = (BigInt(vault.totalValueLocked) + BigInt(input.profitAmount)).toString();
    await db.vault.update({
      where: { id: vault.id },
      data: { totalValueLocked: newTVL },
    });

    return { success: true, profit };
  });
