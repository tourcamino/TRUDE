import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const registerAffiliate = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      referrerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    })
  )
  .mutation(async ({ input }) => {
    if (input.userAddress === input.referrerAddress) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User cannot refer themselves",
      });
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { address: input.userAddress },
    });

    if (!user) {
      user = await db.user.create({
        data: { address: input.userAddress },
      });
    }

    // Check if user already has an affiliate
    const existingAffiliate = await db.affiliate.findUnique({
      where: { userId: user.id },
    });

    if (existingAffiliate) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already registered with an affiliate",
      });
    }

    // Find or create referrer
    let referrer = await db.user.findUnique({
      where: { address: input.referrerAddress },
    });

    if (!referrer) {
      referrer = await db.user.create({
        data: { address: input.referrerAddress },
      });
    }

    // Create affiliate relationship
    const affiliate = await db.affiliate.create({
      data: {
        userId: user.id,
        referrerId: referrer.id,
        totalEarnings: "0",
      },
    });

    return { success: true, affiliate };
  });
