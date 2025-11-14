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
  const profit18 = profitSmallest * 1000000000000n; // assume 6→18 decimals scale
  const ONE = 1000000000000000000n; // 1e18
  const MILLION = 1000000n * ONE; // 1,000,000 ether
  let base: number;
  if (profit18 <= ONE) {
    base = 1;
  } else if (profit18 >= MILLION) {
    base = 20;
  } else {
    // 1 + ((profit * 19) / 1,000,000 ether)
    const num = (profit18 * 19n) / MILLION;
    const frac = Number(num); // safe for reasonable values
    base = 1 + frac;
  }
  return Math.min(base, Math.max(1, maxFeePercent));
}

export const getRevenueMetrics = baseProcedure
  .query(async () => {
    const vaults = await db.vault.findMany({ where: {} });
    const tvlTotal = vaults.reduce((acc: bigint, v: { totalValueLocked: string }) => acc + toBigInt(v.totalValueLocked), 0n);

    const settings = await db.factorySettings.findFirst();
    const affiliateShareBps = settings?.affiliateShareBps ?? 5000;
    const maxFeePercent = settings?.maxFeePercent ?? 20;

    const capitalWithdrawals = await db.capitalWithdrawal.findMany({ where: {} });
    const ownerCapitalFees = capitalWithdrawals.reduce((acc: bigint, w: { amount: string }) => acc + calcCapitalFee(toBigInt(w.amount)), 0n);

    const profits = await db.profit.findMany({ where: { withdrawn: true } });
    let ownerProfitFees = 0n;
    let affiliateProfitFees = 0n;
    for (const p of profits as Array<{ amount: string }>) {
      const amt = toBigInt(p.amount);
      const pct = calcDynamicProfitFeePercent(amt, maxFeePercent); // percent out of 100
      const fee = (amt * BigInt(pct)) / 100n;
      const affiliateCut = (fee * BigInt(affiliateShareBps)) / 10000n;
      const ownerCut = fee - affiliateCut;
      affiliateProfitFees += affiliateCut;
      ownerProfitFees += ownerCut;
    }

    return {
      success: true,
      tvlTotal: tvlTotal.toString(),
      fees: {
        owner: {
          capital: ownerCapitalFees.toString(),
          profit: ownerProfitFees.toString(),
          total: (ownerCapitalFees + ownerProfitFees).toString(),
        },
        affiliate: {
          profit: affiliateProfitFees.toString(),
          total: affiliateProfitFees.toString(),
        },
      },
      counts: {
        vaults: vaults.length,
        capitalWithdrawals: capitalWithdrawals.length,
        profitsWithdrawn: profits.length,
      },
    } as const;
  });