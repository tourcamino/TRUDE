import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getUserDashboard = baseProcedure
  .input(
    z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    })
  )
  .query(async ({ input }) => {
    const user = await db.user.findUnique({
      where: { address: input.userAddress },
      include: {
        deposits: {
          include: {
            vault: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        profits: {
          include: {
            vault: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        withdrawals: {
          include: {
            vault: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        affiliateRelation: true,
      },
    });

    if (!user) {
      return {
        totalDeposited: "0",
        totalProfits: "0",
        availableProfits: "0",
        withdrawnProfits: "0",
        availablePrincipal: "0",
        totalWithdrawnCapital: "0",
        deposits: [],
        profits: [],
        withdrawals: [],
        hasAffiliate: false,
        performanceData: [],
      };
    }

    // Calculate totals
    let totalDeposited = BigInt(0);
    for (const deposit of user.deposits) {
      totalDeposited += BigInt(deposit.amount);
    }

    let totalProfits = BigInt(0);
    let availableProfits = BigInt(0);
    let withdrawnProfits = BigInt(0);
    for (const profit of user.profits) {
      totalProfits += BigInt(profit.amount);
      if (profit.withdrawn) {
        withdrawnProfits += BigInt(profit.amount);
      } else {
        availableProfits += BigInt(profit.amount);
      }
    }

    let totalWithdrawnCapital = BigInt(0);
    for (const w of user.withdrawals) {
      totalWithdrawnCapital += BigInt(w.amount);
    }
    const availablePrincipal = totalDeposited - totalWithdrawnCapital;

    // Build performance data for graph (combine deposits and profits chronologically)
    const performanceEvents = [
      ...user.deposits.map((d: any) => ({
        date: d.createdAt,
        type: 'deposit' as const,
        amount: d.amount,
        vaultSymbol: d.vault.tokenSymbol,
      })),
      ...user.withdrawals.map((w: any) => ({
        date: w.createdAt,
        type: 'withdrawal' as const,
        amount: w.amount,
        vaultSymbol: w.vault.tokenSymbol,
      })),
      ...user.profits.map((p: any) => ({
        date: p.createdAt,
        type: 'profit' as const,
        amount: p.amount,
        vaultSymbol: p.vault.tokenSymbol,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate cumulative balance over time
    let cumulativeBalance = BigInt(0);
    const performanceData = performanceEvents.map(event => {
      if (event.type === 'deposit') {
        cumulativeBalance += BigInt(event.amount);
      } else if (event.type === 'withdrawal') {
        cumulativeBalance -= BigInt(event.amount);
      } else {
        cumulativeBalance += BigInt(event.amount);
      }
      return {
        date: event.date,
        balance: cumulativeBalance.toString(),
        type: event.type,
        vaultSymbol: event.vaultSymbol,
      };
    });

    return {
      totalDeposited: totalDeposited.toString(),
      totalProfits: totalProfits.toString(),
      availableProfits: availableProfits.toString(),
      withdrawnProfits: withdrawnProfits.toString(),
      availablePrincipal: availablePrincipal.toString(),
      totalWithdrawnCapital: totalWithdrawnCapital.toString(),
      deposits: user.deposits.map((d: any) => ({
        id: d.id,
        amount: d.amount,
        createdAt: d.createdAt,
        vaultId: d.vaultId,
        vaultAddress: d.vault.address,
        vaultSymbol: d.vault.tokenSymbol,
      })),
      profits: user.profits.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        withdrawn: p.withdrawn,
        createdAt: p.createdAt,
        vaultId: p.vaultId,
        vaultAddress: p.vault.address,
        vaultSymbol: p.vault.tokenSymbol,
      })),
      withdrawals: user.withdrawals.map((w: any) => ({
        id: w.id,
        amount: w.amount,
        createdAt: w.createdAt,
        vaultId: w.vaultId,
        vaultAddress: w.vault.address,
        vaultSymbol: w.vault.tokenSymbol,
      })),
      hasAffiliate: !!user.affiliateRelation,
      performanceData,
    };
  });
