import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { Prisma } from "@prisma/client";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

// Allows registering/updating a service delegation for a user
// Useful to enable the "auto" capital withdrawal flow with configurable policy
export const registerServiceDelegation = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      delegatedSigner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      status: z.enum(["ACTIVE", "REVOKED"]).optional().default("ACTIVE"),
      policy: z
        .object({
          allowlist: z.array(z.string()).optional(),
          maxPerTx: z.string().regex(/^\d+$/).optional(),
          dailyLimit: z.string().regex(/^\d+$/).optional(),
          custodial: z.boolean().optional(),
        })
        .optional()
        .default({}),
    })
  )
  .mutation(async ({ input }) => {
    const configured = env.TRPC_ADMIN_TOKEN ?? "admin123";
    if (input.adminToken !== configured) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) {
      user = await db.user.create({ data: { address: input.userAddress } });
    }

    // Upsert active delegation for the user
    const existing = await db.serviceDelegation.findFirst({ where: { userId: user.id, status: "ACTIVE" } });
    const policyJson: Prisma.InputJsonValue = (input.policy ?? {}) as unknown as Prisma.InputJsonValue;

    const payload = {
      userId: user.id,
      delegatedSigner: input.delegatedSigner,
      status: input.status,
      policy: policyJson,
    } as const;

    const delegation = existing
      ? await db.serviceDelegation.update({ where: { id: (existing as any).id }, data: payload })
      : await db.serviceDelegation.create({ data: payload });

    return { success: true, delegation };
  });
