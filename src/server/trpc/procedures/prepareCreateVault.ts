import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { adminProcedure, baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { buildCreateVaultCalldata } from "~/server/utils/onchain";

export const prepareCreateVault = adminProcedure
  .input(z.object({ tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }))
  .mutation(async ({ input }) => {
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const preparedTx = { to: env.FACTORY_ADDRESS as string, data: buildCreateVaultCalldata(input.tokenAddress), value: "0x0", chainId } as const;
    if (!preparedTx.to) throw new TRPCError({ code: "BAD_REQUEST", message: "Missing FACTORY_ADDRESS" });
    return { success: true, preparedTx };
  });

export const finalizeCreateVault = baseProcedure
  .input(z.object({ vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), tokenSymbol: z.string(), ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), ledgerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }))
  .mutation(async ({ input }) => {
    const exists = await db.vault.findUnique({ where: { address: input.vaultAddress } });
    if (exists) return { success: true, vaultId: exists.id };
    const v = await db.vault.create({ data: { address: input.vaultAddress, tokenAddress: input.tokenAddress, tokenSymbol: input.tokenSymbol, ownerAddress: input.ownerAddress, ledgerAddress: input.ledgerAddress } });
    return { success: true, vaultId: v.id };
  });
