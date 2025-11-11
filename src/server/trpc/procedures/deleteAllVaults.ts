import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

// Danger: bulk deletion intended for development/admin use only.
export const deleteAllVaults = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const configured = env.TRPC_ADMIN_TOKEN ?? "admin123";
    if (input.adminToken !== configured) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
    }

    // Delete in dependency-safe order
    const auditLogs = await db.auditLog.deleteMany({});
    const requests = await db.withdrawalRequest.deleteMany({});
    const withdrawals = await db.capitalWithdrawal.deleteMany({});
    const profits = await db.profit.deleteMany({});
    const deposits = await db.deposit.deleteMany({});
    const vaults = await db.vault.deleteMany({});

    return {
      success: true,
      deleted: {
        auditLogs: auditLogs.count,
        requests: requests.count,
        withdrawals: withdrawals.count,
        profits: profits.count,
        deposits: deposits.count,
        vaults: vaults.count,
      },
    };
  });