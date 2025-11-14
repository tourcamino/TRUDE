import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { buildApproveCalldata, buildDepositCalldata } from "~/server/utils/onchain";

export const prepareDeposit = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      vaultId: z.number(),
      amount: z.string().regex(/^\d+$/),
    })
  )
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    if (vault.isPaused) throw new TRPCError({ code: "FORBIDDEN", message: "Vault is paused" });
    const settings = await db.factorySettings.findFirst();
    const minDeposit = BigInt(settings?.minDeposit || "0");
    const amountBI = BigInt(input.amount);
    if (amountBI < minDeposit) throw new TRPCError({ code: "BAD_REQUEST", message: "Deposit below minimum" });
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const approveTx = { to: vault.tokenAddress, data: buildApproveCalldata(vault.address, amountBI), value: "0x0", chainId } as const;
    const depositTx = { to: vault.address, data: buildDepositCalldata(amountBI), value: "0x0", chainId } as const;
    return { success: true, prepared: { approveTx, depositTx } };
  });
