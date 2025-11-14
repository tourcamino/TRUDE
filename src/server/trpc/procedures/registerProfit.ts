import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "../../../server/db";
import { baseProcedure } from "../../../server/trpc/main";

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

    const settings = await db.factorySettings.findFirst();
    const maxFeePercent = settings?.maxFeePercent ?? 20;
    const affiliateShareBps = settings?.affiliateShareBps ?? 5000;
    const aff = await db.affiliate.findUnique({ where: { userId: user.id } });
    if (aff) {
      const amt = BigInt(input.profitAmount);
      const ONE = 1000000000000000000n;
      const MILLION = 1000000n * ONE;
      const amt18 = amt * 1000000000000n;
      let base: number;
      if (amt18 <= ONE) {
        base = 1;
      } else if (amt18 >= MILLION) {
        base = 20;
      } else {
        const num = (amt18 * 19n) / MILLION;
        base = 1 + Number(num);
      }
      const pct = Math.min(base, Math.max(1, maxFeePercent));
      const fee = (amt * BigInt(pct)) / 100n;
      const affiliateCut = (fee * BigInt(affiliateShareBps)) / 10000n;
      await db.affiliate.update({
        where: { id: aff.id },
        data: { totalEarnings: (BigInt(aff.totalEarnings) + affiliateCut).toString() },
      });
    }

    return { success: true, profit };
  });
