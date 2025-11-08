import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getVaultById = baseProcedure
  .input(z.object({ vaultId: z.number() }))
  .query(async ({ input }) => {
    const vault = await db.vault.findUnique({
      where: { id: input.vaultId },
      include: {
        deposits: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        profits: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!vault) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vault not found",
      });
    }

    return vault;
  });
