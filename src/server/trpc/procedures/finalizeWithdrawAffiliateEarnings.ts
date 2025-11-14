import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../../trpc/main";
import { db } from "../../db";

export const finalizeWithdrawAffiliateEarnings = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      requestId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    const req = await db.withdrawalRequest.findUnique({ where: { id: input.requestId }, include: { user: true } });
    if (!req || req.userId !== user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Invalid request" });
    if (req.status !== "PENDING") throw new TRPCError({ code: "BAD_REQUEST", message: "Request not pending" });

    const aff = await db.affiliate.findUnique({ where: { userId: user.id } });
    if (!aff) throw new TRPCError({ code: "BAD_REQUEST", message: "No affiliate earnings" });

    const amount = BigInt(req.amount);
    const available = BigInt(aff.totalEarnings);
    if (amount > available) throw new TRPCError({ code: "BAD_REQUEST", message: "Amount exceeds available" });

    await db.affiliate.update({ where: { id: aff.id }, data: { totalEarnings: (available - amount).toString() } });
    await db.withdrawalRequest.update({ where: { id: req.id }, data: { status: "EXECUTED" } });
    await db.auditLog.create({ data: { action: "FINALIZE_WITHDRAW_AFFILIATE_EARNINGS", status: "EXECUTED", userId: user.id, details: { requestId: req.id, amount: req.amount } } });

    return { success: true } as const;
  });