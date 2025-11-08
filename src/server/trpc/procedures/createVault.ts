import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const createVault = baseProcedure
  .input(
    z.object({
      tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      tokenSymbol: z.string().min(1).max(10),
      ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      ledgerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    })
  )
  .mutation(async ({ input }) => {
    let settings: Awaited<ReturnType<typeof db.factorySettings.findFirst>> | null = null;
    try {
      settings = await db.factorySettings.findFirst();
    } catch (err) {
      console.error("createVault: database unavailable", err);
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message:
          "Database unavailable. Start Docker services or configure DATABASE_URL for local development.",
      });
    }
    
    if (settings?.isPaused) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Factory is paused",
      });
    }

    // Accept any token symbol for test vaults; no USDC restriction

    // Generate a mock vault address
    const vaultAddress = `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`;

    const vault = await db.vault.create({
      data: {
        address: vaultAddress,
        tokenAddress: input.tokenAddress,
        tokenSymbol: input.tokenSymbol,
        ownerAddress: input.ownerAddress,
        ledgerAddress: input.ledgerAddress,
        totalValueLocked: "0",
        isPaused: false,
      },
    });

    return { success: true, vault };
  });
