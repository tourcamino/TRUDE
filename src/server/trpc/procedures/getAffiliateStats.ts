import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getAffiliateStats = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    })
  )
  .query(async ({ input }) => {
    const user = await db.user.findUnique({
      where: { address: input.userAddress },
      include: {
        referredUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!user) {
      return {
        totalEarnings: "0",
        referralCount: 0,
        referrals: [],
      };
    }

    // Calculate total earnings from all referred users
    let totalEarnings = BigInt(0);
    for (const affiliate of user.referredUsers) {
      totalEarnings += BigInt(affiliate.totalEarnings);
    }

    return {
      totalEarnings: totalEarnings.toString(),
      referralCount: user.referredUsers.length,
      referrals: user.referredUsers.map((a: any) => ({
        address: a.user.address,
        earnings: a.totalEarnings,
        joinedAt: a.createdAt,
      })),
    };
  });
