import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const updateFactorySettings = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
      minDeposit: z.string().optional(),
      affiliateShareBps: z.number().min(0).max(10000).optional(),
      maxFeePercent: z.number().min(0).max(100).optional(),
      isPaused: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Simple admin check (in production, this would be more sophisticated)
    if (input.adminToken !== "admin123") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid admin token",
      });
    }

    const settings = await db.factorySettings.findFirst();
    
    if (!settings) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Factory settings not found",
      });
    }

    const updated = await db.factorySettings.update({
      where: { id: settings.id },
      data: {
        ...(input.minDeposit !== undefined && { minDeposit: input.minDeposit }),
        ...(input.affiliateShareBps !== undefined && { affiliateShareBps: input.affiliateShareBps }),
        ...(input.maxFeePercent !== undefined && { maxFeePercent: input.maxFeePercent }),
        ...(input.isPaused !== undefined && { isPaused: input.isPaused }),
      },
    });

    return { success: true, settings: updated };
  });
