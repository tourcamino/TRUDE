import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const pauseVault = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
      vaultId: z.number(),
      isPaused: z.boolean(),
    })
  )
  .mutation(async ({ input }) => {
    if (input.adminToken !== "admin123") {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
    }

    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    }

    const updated = await db.vault.update({
      where: { id: input.vaultId },
      data: { isPaused: input.isPaused },
    });

    return { success: true, vault: updated };
  });