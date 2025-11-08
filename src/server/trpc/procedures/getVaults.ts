import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getVaults = baseProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const { limit, cursor } = input;
    try {
      const vaults = await db.vault.findMany({
        take: limit + 1,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: number | undefined = undefined;
      if (vaults.length > limit) {
        const nextItem = vaults.pop();
        nextCursor = nextItem?.id;
      }

      return {
        vaults,
        nextCursor,
      };
    } catch (err) {
      console.error("getVaults failed:", err);
      return {
        vaults: [],
        nextCursor: undefined,
      };
    }
  });
