import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const pauseAllVaults = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
      isPaused: z.boolean().default(true),
    })
  )
  .mutation(async ({ input }) => {
    const configured = env.TRPC_ADMIN_TOKEN ?? "admin123";
    if (input.adminToken !== configured) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
    }

    const res = await db.vault.updateMany({ data: { isPaused: input.isPaused } });
    return { success: true, updatedCount: res.count, isPaused: input.isPaused };
  });