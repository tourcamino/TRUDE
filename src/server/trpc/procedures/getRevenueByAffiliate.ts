import { baseProcedure } from "../../../server/trpc/main";
import { db } from "../../../server/db";

function toBigInt(value: string | number | bigint) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  return BigInt(value);
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

export const getRevenueByAffiliate = baseProcedure.query(async () => {
  const settings = await db.factorySettings.findFirst();
  const affiliateShareBps = settings?.affiliateShareBps ?? 5000;
  const maxFeePercent = settings?.maxFeePercent ?? 20;

  const profits = await db.profit.findMany({ where: { withdrawn: true } });

  const map = new Map<number, { referrerId: number; users: Set<number>; affiliateFees: bigint; ownerFees: bigint }>();

  for (const p of profits as Array<{ amount: string; userId: number }>) {
    const aff = await db.affiliate.findUnique({ where: { userId: p.userId } });
    if (!aff) continue;
    const amt = toBigInt(p.amount);
    const pct = calcDynamicProfitFeePercent(amt, maxFeePercent);
    const fee = (amt * BigInt(pct)) / 100n;
    const affiliateCut = (fee * BigInt(affiliateShareBps)) / 10000n;
    const ownerCut = fee - affiliateCut;
    const bucket = map.get(aff.referrerId) || { referrerId: aff.referrerId, users: new Set<number>(), affiliateFees: 0n, ownerFees: 0n };
    bucket.users.add(p.userId);
    bucket.affiliateFees += affiliateCut;
    bucket.ownerFees += ownerCut;
    map.set(aff.referrerId, bucket);
  }

  const entries: Array<{ referrerId: number; usersCount: number; affiliateProfitFees: string; ownerProfitFees: string }> = [];
  for (const [, v] of map) {
    entries.push({
      referrerId: v.referrerId,
      usersCount: v.users.size,
      affiliateProfitFees: v.affiliateFees.toString(),
      ownerProfitFees: v.ownerFees.toString(),
    });
  }

  entries.sort((a, b) => BigInt(b.affiliateProfitFees) > BigInt(a.affiliateProfitFees) ? 1 : -1);

  return { success: true, affiliates: entries } as const;
});