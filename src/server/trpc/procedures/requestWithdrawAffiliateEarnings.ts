import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../../trpc/main";
import { db } from "../../db";
import { env } from "../../env";
import { getMinProfitUSDForNetwork } from "../../config/networks";

export const requestWithdrawAffiliateEarnings = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      amountSmallest: z.string().regex(/^\d+$/).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    const aff = await db.affiliate.findUnique({ where: { userId: user.id } });
    if (!aff) throw new TRPCError({ code: "BAD_REQUEST", message: "No affiliate earnings" });

    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : 8453;
    const networkKey = (function(id: number){
      const map: Record<number, string> = { 1: 'ethereum', 137: 'polygon', 42161: 'arbitrum', 10: 'optimism', 8453: 'base' };
      return map[id] || 'base';
    })(chainId);
    const minUSD = getMinProfitUSDForNetwork(networkKey);

    const available = BigInt(aff.totalEarnings);
    if (available <= 0n) throw new TRPCError({ code: "BAD_REQUEST", message: "No earnings available" });

    const decimals = 6;
    const tokens = Number(available) / Number(BigInt("1" + "0".repeat(decimals)));
    const usd = tokens;
    if (usd < minUSD) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Earnings (${usd.toFixed(2)} USD) below threshold (${minUSD} USD). Accumulate and withdraw later.` });
    }

    const amount = input.amountSmallest ? BigInt(input.amountSmallest) : available;
    if (amount > available) throw new TRPCError({ code: "BAD_REQUEST", message: "Amount exceeds available" });

    const req = await db.withdrawalRequest.create({
      data: {
        userId: user.id,
        vaultId: 0,
        amount: amount.toString(),
        mode: "auto",
        status: "PENDING",
        onChain: false,
        requestHash: `${user.address}-${Date.now()}`,
      },
    });

    await db.auditLog.create({
      data: {
        action: "REQUEST_WITHDRAW_AFFILIATE_EARNINGS",
        status: "PENDING",
        userId: user.id,
        details: { amount: amount.toString(), minUSD, chainId },
      },
    });

    return { success: true, requestId: req.id } as const;
  });