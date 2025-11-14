import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { adminProcedure, baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { buildDepositCalldata } from "~/server/utils/onchain";
import { buildPermitCalldata } from "~/server/utils/permit";

export const preparePermitTypedData = baseProcedure
  .input(z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    vaultId: z.number(),
    value: z.string().regex(/^\d+$/),
    deadline: z.string().regex(/^\d+$/),
  }))
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    if (!chainId) throw new TRPCError({ code: "BAD_REQUEST", message: "Missing CHAIN_ID" });
    const typedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      domain: {
        name: vault.tokenSymbol || "Token",
        version: "1",
        chainId,
        verifyingContract: vault.tokenAddress,
      },
      primaryType: "Permit",
      message: {
        owner: input.userAddress,
        spender: vault.address,
        value: input.value,
        nonce: "0", // client should fetch real nonce from token if available
        deadline: input.deadline,
      },
    } as const;
    return { success: true, typedData };
  });

export const preparePermitAndDeposit = baseProcedure
  .input(z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    vaultId: z.number(),
    value: z.string().regex(/^\d+$/),
    deadline: z.string().regex(/^\d+$/),
    v: z.number().int(),
    r: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
    s: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  }))
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const amountBI = BigInt(input.value);
    const permitCalldata = buildPermitCalldata({
      owner: input.userAddress,
      spender: vault.address,
      value: amountBI,
      nonce: 0n,
      deadline: BigInt(input.deadline),
    }, { v: input.v, r: input.r, s: input.s });
    const depositCalldata = buildDepositCalldata(amountBI);
    const permitTx = { to: vault.tokenAddress, data: permitCalldata, value: "0x0", chainId } as const;
    const depositTx = { to: vault.address, data: depositCalldata, value: "0x0", chainId } as const;
    return { success: true, prepared: { permitTx, depositTx } };
  });