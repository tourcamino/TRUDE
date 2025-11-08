import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const deleteVault = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
      vaultId: z.number(),
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

    // Remove related records first due to referential integrity
    await db.deposit.deleteMany({ where: { vaultId: input.vaultId } });
    await db.profit.deleteMany({ where: { vaultId: input.vaultId } });

    await db.vault.delete({ where: { id: input.vaultId } });

    return { success: true };
  });