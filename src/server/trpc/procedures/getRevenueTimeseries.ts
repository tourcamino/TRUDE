import { baseProcedure } from "../../../server/trpc/main";
import { db } from "../../../server/db";
import { z } from "zod";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toBigInt(v: string | number | bigint) {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(Math.trunc(v));
  return BigInt(v);
}

function calcCapitalFee(amount: bigint) {
  return (amount * 10n) / 10000n; // 0.1%
}

function calcDynamicProfitFeePercent(profitSmallest: bigint, maxFeePercent: number) {
  const profit18 = profitSmallest * 1000000000000n; // scale 6→18
  const ONE = 1000000000000000000n;
  const MILLION = 1000000n * ONE;
  let base: number;
  if (profit18 <= ONE) {
    base = 1;
  } else if (profit18 >= MILLION) {
    base = 20;
  } else {
    const num = (profit18 * 19n) / MILLION;
    base = 1 + Number(num);
  }
  return Math.min(base, Math.max(1, maxFeePercent));
}

export const getRevenueTimeseries = baseProcedure
  .input(z.object({ days: z.number().min(1).max(90).default(14), vaultId: z.number().optional(), referrerId: z.number().optional() }))
  .query(async ({ input }) => {
  const settings = await db.factorySettings.findFirst();
  const affiliateShareBps = settings?.affiliateShareBps ?? 5000;
  const maxFeePercent = settings?.maxFeePercent ?? 20;

  const days = input.days ?? 14;
  const today = startOfDay(new Date());
  const buckets: Array<{ date: string; owner: bigint; affiliate: bigint; ownerCapital: bigint; ownerProfit: bigint; affiliateProfit: bigint }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.push({
      date: d.toISOString(),
      owner: 0n,
      affiliate: 0n,
      ownerCapital: 0n,
      ownerProfit: 0n,
      affiliateProfit: 0n,
    });
  }

  const caps = await db.capitalWithdrawal.findMany({ where: input.vaultId ? { vaultId: input.vaultId } : {} });
  const affiliates = await db.affiliate.findMany({ where: {} });
  const affMap = new Map<number, number>();
  for (const a of affiliates as Array<{ userId: number; referrerId: number }>) affMap.set(a.userId, a.referrerId);
  for (const w of caps as Array<{ amount: string; createdAt?: Date; userId?: number }>) {
    if (input.referrerId && w.userId && affMap.get(w.userId) !== input.referrerId) continue;
    const date = startOfDay(w.createdAt ? new Date(w.createdAt) : new Date());
    const idx = buckets.findIndex((b) => startOfDay(new Date(b.date)).getTime() === date.getTime());
    if (idx >= 0 && buckets[idx]) {
      const fee = calcCapitalFee(toBigInt(w.amount));
      buckets[idx].ownerCapital += fee;
    }
  }

  const profits = await db.profit.findMany({ where: input.vaultId ? { withdrawn: true, vaultId: input.vaultId } : { withdrawn: true } });
  for (const p of profits as Array<{ amount: string; createdAt?: Date; userId?: number }>) {
    if (input.referrerId && p.userId && affMap.get(p.userId) !== input.referrerId) continue;
    const date = startOfDay(p.createdAt ? new Date(p.createdAt) : new Date());
    const idx = buckets.findIndex((b) => startOfDay(new Date(b.date)).getTime() === date.getTime());
    if (idx >= 0 && buckets[idx]) {
      const amt = toBigInt(p.amount);
      const pct = calcDynamicProfitFeePercent(amt, maxFeePercent);
      const fee = (amt * BigInt(pct)) / 100n;
      const affiliateCut = (fee * BigInt(affiliateShareBps)) / 10000n;
      const ownerCut = fee - affiliateCut;
      buckets[idx].ownerProfit += ownerCut;
      buckets[idx].affiliateProfit += affiliateCut;
    }
  }

  for (const b of buckets) {
    b.owner = b.ownerCapital + b.ownerProfit;
    b.affiliate = b.affiliateProfit;
  }

  return {
    success: true,
    days,
    series: buckets.map((b) => ({
      date: b.date,
      owner: b.owner.toString(),
      affiliate: b.affiliate.toString(),
      ownerCapital: b.ownerCapital.toString(),
      ownerProfit: b.ownerProfit.toString(),
      affiliateProfit: b.affiliateProfit.toString(),
    })),
  } as const;
});