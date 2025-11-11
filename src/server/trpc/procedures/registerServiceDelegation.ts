import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

// Consente di registrare/aggiornare una delega di servizio per un utente
// Utile per abilitare il flusso di prelievo capitale in modalità "auto" con policy configurabile
export const registerServiceDelegation = baseProcedure
  .input(
    z.object({
      adminToken: z.string(),
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      delegatedSigner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
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

    // Trova o crea l'utente
    let user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) {
      user = await db.user.create({ data: { address: input.userAddress } });
    }

    // Upsert delega attiva per l'utente
    const existing = await db.serviceDelegation.findFirst({ where: { userId: user.id, status: "ACTIVE" } });
    const payload = {
      userId: user.id,
      delegatedSigner: input.delegatedSigner,
      status: input.status,
      policy: input.policy as unknown as Record<string, unknown>,
    } as const;

    const delegation = existing
      ? await db.serviceDelegation.update({ where: { id: (existing as any).id }, data: payload })
      : await db.serviceDelegation.create({ data: payload });

    return { success: true, delegation };
  });