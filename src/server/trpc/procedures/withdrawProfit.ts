import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

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

    // Mark as withdrawn
    const updatedProfit = await db.profit.update({
      where: { id: input.profitId },
      data: { withdrawn: true },
    });

    return { 
      success: true, 
      profit: updatedProfit,
      amount: profit.amount,
    };
  });
