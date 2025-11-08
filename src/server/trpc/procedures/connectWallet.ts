import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const connectWallet = baseProcedure
  .input(
    z.object({
      address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      chainId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Check if user already exists
    let user = await db.user.findUnique({
      where: {
        address: input.address.toLowerCase(),
      },
    });

    // Create user if doesn't exist
    const isNewUser = !user;
    if (!user) {
      user = await db.user.create({
        data: {
          address: input.address.toLowerCase(),
        },
      });
    }

    return {
      success: true,
      userId: user.id,
      address: user.address,
      isNewUser,
    };
  });
