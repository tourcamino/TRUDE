import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { adminProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { Interface } from "ethers";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const vaultArtifact = require("../../../../artifacts/contracts/TrudeVault.sol/TrudeVault.json");

const iface = new Interface((vaultArtifact as any).abi);

export const pauseVaultOnChain = adminProcedure
  .input(z.object({ vaultId: z.number() }))
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const preparedTx = { to: vault.address, data: iface.encodeFunctionData("pause", []), value: "0x0", chainId } as const;
    return { success: true, preparedTx };
  });

export const unpauseVaultOnChain = adminProcedure
  .input(z.object({ vaultId: z.number() }))
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const preparedTx = { to: vault.address, data: iface.encodeFunctionData("unpause", []), value: "0x0", chainId } as const;
    return { success: true, preparedTx };
  });
