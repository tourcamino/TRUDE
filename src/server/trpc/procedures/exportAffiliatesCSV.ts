import { baseProcedure } from "../../../server/trpc/main.ts";
import { db } from "../../../server/db.ts";

function toDecimal6(s: string) {
  const v = (BigInt(s || "0") * 100n) / 100n;
  const str = v.toString().padStart(7, "0");
  const int = str.slice(0, -6);
  const frac = str.slice(-6).replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

export const exportAffiliatesCSV = baseProcedure.mutation(async () => {
  const affiliates = await db.affiliate.findMany({ where: {} });
  const users = await db.user.findMany({ where: {} });
  const userById = new Map<number, { id: number; address: string }>();
  for (const u of users as Array<{ id: number; address: string }>) userById.set(u.id, u);

  const refMap = new Map<number, { referrerAddress: string; usersCount: number; totalEarnings: bigint }>();
  for (const a of affiliates as Array<{ userId: number; referrerId: number; totalEarnings: string }>) {
    const refUser = userById.get(a.referrerId);
    if (!refUser) continue;
    const bucket = refMap.get(a.referrerId) || { referrerAddress: refUser.address, usersCount: 0, totalEarnings: 0n };
    bucket.usersCount += 1;
    bucket.totalEarnings += BigInt(a.totalEarnings || "0");
    refMap.set(a.referrerId, bucket);
  }

  const rows: string[] = [];
  rows.push(["referrer_address", "referred_users", "total_earnings_smallest", "total_earnings_usdc"].join(","));
  for (const [, v] of refMap) {
    rows.push([v.referrerAddress, String(v.usersCount), v.totalEarnings.toString(), toDecimal6(v.totalEarnings.toString())].join(","));
  }

  const csv = rows.join("\n");
  const filename = `affiliates-${Date.now()}.csv`;
  await db.auditLog.create({ data: { action: "EXPORT_AFFILIATES_CSV", status: "EXECUTED", details: { rows: rows.length } } });
  return { success: true, filename, csv } as const;
});