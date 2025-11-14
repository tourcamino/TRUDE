import { baseProcedure } from "../../../server/trpc/main";
import { db } from "../../../server/db";

function toBigInt(value: string | number | bigint) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  return BigInt(value);
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

export const getRevenueByVault = baseProcedure.query(async () => {
  const settings = await db.factorySettings.findFirst();
  const affiliateShareBps = settings?.affiliateShareBps ?? 5000;
  const maxFeePercent = settings?.maxFeePercent ?? 20;

  const vaults = await db.vault.findMany({ where: {} });
  const map = new Map<number, { vaultId: number; tvl: bigint; capitalFeesOwner: bigint; profitFeesOwner: bigint; profitFeesAffiliate: bigint }>();

  for (const v of vaults as Array<{ id: number; totalValueLocked: string }>) {
    map.set(v.id, { vaultId: v.id, tvl: toBigInt(v.totalValueLocked), capitalFeesOwner: 0n, profitFeesOwner: 0n, profitFeesAffiliate: 0n });
  }

  const caps = await db.capitalWithdrawal.findMany({ where: {} });
  for (const w of caps as Array<{ vaultId: number; amount: string }>) {
    const fee = calcCapitalFee(toBigInt(w.amount));
    const bucket = map.get(w.vaultId);
    if (bucket) bucket.capitalFeesOwner += fee;
  }

  const profits = await db.profit.findMany({ where: { withdrawn: true } });
  for (const p of profits as Array<{ vaultId: number; amount: string; userId: number }>) {
    const amt = toBigInt(p.amount);
    const pct = calcDynamicProfitFeePercent(amt, maxFeePercent);
    const fee = (amt * BigInt(pct)) / 100n;
    const affiliateCut = (fee * BigInt(affiliateShareBps)) / 10000n;
    const ownerCut = fee - affiliateCut;
    const bucket = map.get(p.vaultId);
    if (bucket) {
      bucket.profitFeesAffiliate += affiliateCut;
      bucket.profitFeesOwner += ownerCut;
    }
  }

  const entries: Array<{ vaultId: number; tvl: string; ownerFeesCapital: string; ownerFeesProfit: string; ownerFeesTotal: string; affiliateFeesProfit: string }> = [];
  for (const [, v] of map) {
    entries.push({
      vaultId: v.vaultId,
      tvl: v.tvl.toString(),
      ownerFeesCapital: v.capitalFeesOwner.toString(),
      ownerFeesProfit: v.profitFeesOwner.toString(),
      ownerFeesTotal: (v.capitalFeesOwner + v.profitFeesOwner).toString(),
      affiliateFeesProfit: v.profitFeesAffiliate.toString(),
    });
  }

  entries.sort((a, b) => BigInt(b.ownerFeesTotal) > BigInt(a.ownerFeesTotal) ? 1 : -1);

  return { success: true, vaults: entries } as const;
});