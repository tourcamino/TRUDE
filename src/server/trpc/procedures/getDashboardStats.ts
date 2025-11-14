import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getDashboardStats = baseProcedure.query(async () => {
  try {
    const vaults = await db.vault.findMany();
    const deposits = await db.deposit.findMany();
    const profits = await db.profit.findMany();
    const users = await db.user.count();
    const affiliates = await db.affiliate.count();

    // Calculate total TVL
    let totalTVL = BigInt(0);
    for (const vault of vaults) {
      totalTVL += BigInt(vault.totalValueLocked);
    }

    // Calculate total deposits
    let totalDeposits = BigInt(0);
    for (const deposit of deposits) {
      totalDeposits += BigInt(deposit.amount);
    }

    // Calculate total profits
    let totalProfits = BigInt(0);
    for (const profit of profits) {
      totalProfits += BigInt(profit.amount);
    }

    return {
      totalTVL: totalTVL.toString(),
      totalDeposits: totalDeposits.toString(),
      totalProfits: totalProfits.toString(),
      vaultCount: vaults.length,
      userCount: users,
      affiliateCount: affiliates,
      isFallback: false,
      recentVaults: vaults.slice(0, 5).map((v: any) => ({
        id: v.id,
        address: v.address,
        tokenSymbol: v.tokenSymbol,
        tvl: v.totalValueLocked,
        createdAt: v.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("getDashboardStats failed:", err);
    return {
      totalTVL: "0",
      totalDeposits: "0",
      totalProfits: "0",
      vaultCount: 0,
      userCount: 0,
      affiliateCount: 0,
      isFallback: true,
      recentVaults: [],
    };
  }
});
