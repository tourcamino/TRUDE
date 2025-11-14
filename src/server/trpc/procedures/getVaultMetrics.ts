import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

/**
 * Returns vault-level metrics used by the Vaults search UI:
 * - tvl: current total value locked (string, smallest unit)
 * - yield30d: percentage over the last 30 days based on profits credited
 * - apr30d: simple annualized rate from 30d yield (yield30d * 365/30)
 * - change24h: net change over the last 24 hours (string, smallest unit)
 * - sparkline: mini series of cumulative recent net changes for inline chart
 */
export const getVaultMetrics = baseProcedure
  .input(
    z.object({
      vaultIds: z.array(z.number()).optional(),
      rangeDays: z.number().min(1).max(90).default(30),
    })
  )
  .query(async ({ input }) => {
    const { vaultIds, rangeDays } = input;

    // Resolve target vaults
    const targetVaults = await db.vault.findMany({
      where: vaultIds && vaultIds.length ? { id: { in: vaultIds } } : undefined,
      orderBy: { createdAt: "desc" },
      take: vaultIds && vaultIds.length ? undefined : 50,
    });

    const now = new Date();
    const from30d = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const from24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    function toNum(str: string): number {
      // amounts are in smallest units of stablecoins (e.g., 6 decimals). Use Number for UI metrics.
      try { return Number(str); } catch { return 0; }
    }

    const metrics = [] as Array<{
      id: number;
      tokenSymbol: string;
      tvl: string;
      yield30d: number;
      apr30d: number;
      change24h: string;
      sparkline: number[];
    }>;

    for (const v of targetVaults) {
      // Fetch recent events for this vault
      const [recentDeposits, recentProfits, recentWithdrawals] = await Promise.all([
        db.deposit.findMany({ where: { vaultId: v.id, createdAt: { gte: from30d } }, orderBy: { createdAt: "asc" } }),
        db.profit.findMany({ where: { vaultId: v.id, createdAt: { gte: from30d } }, orderBy: { createdAt: "asc" } }),
        db.capitalWithdrawal.findMany({ where: { vaultId: v.id, createdAt: { gte: from30d } }, orderBy: { createdAt: "asc" } }),
      ]);

      // 30d yield based on credited profits vs current TVL
      const sumProfits30d = recentProfits.reduce((acc: number, p: any) => acc + toNum(p.amount), 0);
      const tvlNum = Math.max(1, toNum(v.totalValueLocked));
      const yield30d = tvlNum > 0 ? sumProfits30d / tvlNum : 0;
      const apr30d = yield30d * (365 / 30);

      // 24h net change
      const deposits24h = recentDeposits.filter((d: any) => d.createdAt >= from24h).reduce((acc: number, d: any) => acc + toNum(d.amount), 0);
      const profits24h = recentProfits.filter((p: any) => p.createdAt >= from24h).reduce((acc: number, p: any) => acc + toNum(p.amount), 0);
      const withdrawals24h = recentWithdrawals.filter((w: any) => w.createdAt >= from24h).reduce((acc: number, w: any) => acc + toNum(w.amount), 0);
      const net24h = deposits24h + profits24h - withdrawals24h;

      // Sparkline: cumulative net changes over recent events
      const events = [
        ...recentDeposits.map((d: any) => ({ date: d.createdAt, delta: +toNum(d.amount) })),
        ...recentProfits.map((p: any) => ({ date: p.createdAt, delta: +toNum(p.amount) })),
        ...recentWithdrawals.map((w: any) => ({ date: w.createdAt, delta: -toNum(w.amount) })),
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Limit to last 20 points for compact chart
      const lastEvents = events.slice(-20);
      const series: number[] = [];
      let cumulative = 0;
      for (const e of lastEvents) {
        cumulative += e.delta;
        series.push(cumulative);
      }

      metrics.push({
        id: v.id,
        tokenSymbol: v.tokenSymbol,
        tvl: v.totalValueLocked,
        yield30d,
        apr30d,
        change24h: String(net24h),
        sparkline: series.length ? series : [0],
      });
    }

    return { metrics };
  });