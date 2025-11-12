import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

// This procedure handles deposits for stablecoins in the Ethereum environment
// Amounts are stored as strings in the token's smallest unit (e.g., 10 USDC = 10000000 for 6 decimals)
export const createDeposit = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      vaultId: z.number(),
      amount: z.string().regex(/^\d+$/, "Amount must be a valid number string"),
    })
  )
  .mutation(async ({ input }) => {
    const vault = await db.vault.findUnique({
      where: { id: input.vaultId },
    });

    if (!vault) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vault not found",
      });
    }

    // Allow deposits for any token vault; rely on paused state only

    if (vault.isPaused) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Vault is paused",
      });
    }

    // Ensure FactorySettings exist; create sane defaults for stablecoins if missing
    let settings = await db.factorySettings.findFirst();
    if (!settings) {
      settings = await db.factorySettings.create({
        data: {
          minDeposit: "10000000", // 10 USDC with 6 decimals
          affiliateShareBps: 5000, // 50%
          maxFeePercent: 20, // 20%
          isPaused: false,
        },
      });
    }
    const minDeposit = BigInt(settings.minDeposit);
    const depositAmount = BigInt(input.amount);

    const inferTokenDecimals = (symbol?: string) => {
      const s = (symbol || "").toUpperCase();
      if (s.includes("USDC") || s.includes("USDT") || s.includes("BUSD")) return 6;
      if (s.includes("DAI")) return 18;
      return 18;
    };

    const formatDecimalFromSmallest = (smallest: string, decimals: number) => {
      const clean = (smallest || "0").replace(/\D/g, "");
      const padded = clean.padStart(decimals + 1, "0");
      const intPart = padded.slice(0, -decimals) || "0";
      const fracRaw = padded.slice(-decimals);
      const frac = fracRaw.replace(/0+$/, "");
      return frac ? `${intPart}.${frac}` : intPart;
    };

    if (depositAmount < minDeposit) {
      const decs = inferTokenDecimals(vault.tokenSymbol as string);
      const minToken = formatDecimalFromSmallest(settings.minDeposit, decs);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Deposit amount must be at least ${minToken} ${vault.tokenSymbol} (smallest unit: ${settings.minDeposit})`,
      });
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { address: input.userAddress },
    });

    if (!user) {
      user = await db.user.create({
        data: { address: input.userAddress },
      });
    }

    // Create deposit
    const deposit = await db.deposit.create({
      data: {
        userId: user.id,
        vaultId: vault.id,
        amount: input.amount,
      },
    });

    // Update vault TVL
    const newTVL = (BigInt(vault.totalValueLocked) + depositAmount).toString();
    await db.vault.update({
      where: { id: vault.id },
      data: { totalValueLocked: newTVL },
    });

    return { success: true, deposit };
  });
