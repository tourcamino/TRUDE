import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const finalizeRegisterAffiliate = baseProcedure
  .input(z.object({ userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), affiliateAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/) }))
  .mutation(async ({ input }) => {
    let user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) user = await db.user.create({ data: { address: input.userAddress } });
    let affiliateUser = await db.user.findUnique({ where: { address: input.affiliateAddress } });
    if (!affiliateUser) affiliateUser = await db.user.create({ data: { address: input.affiliateAddress } });
    const exists = await db.affiliate.findUnique({ where: { userId: user.id } });
    if (exists) throw new TRPCError({ code: "BAD_REQUEST", message: "Affiliate already registered" });
    await db.affiliate.create({ data: { userId: user.id, referrerId: affiliateUser.id } });
    await db.auditLog.create({ data: { action: "REGISTER_AFFILIATE_EXECUTED", status: "EXECUTED", userId: user.id, details: { txHash: input.txHash, affiliate: input.affiliateAddress } } });
    return { success: true };
  });
