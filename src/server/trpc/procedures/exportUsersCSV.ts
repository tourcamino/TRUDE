import { baseProcedure } from "../../../server/trpc/main.ts";
import { db } from "../../../server/db.ts";

function toDecimal6(s: string) {
  const v = (BigInt(s || "0") * 100n) / 100n;
  const str = v.toString().padStart(7, "0");
  const int = str.slice(0, -6);
  const frac = str.slice(-6).replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

export const exportUsersCSV = baseProcedure.mutation(async () => {
  const users = await db.user.findMany({ where: {} });
  const deposits = await db.deposit.findMany({ where: {} });
  const profits = await db.profit.findMany({ where: {} });
  const withdrawals = await db.capitalWithdrawal.findMany({ where: {} });
  const affiliates = await db.affiliate.findMany({ where: {} });

  const depByUser = new Map<number, bigint>();
  for (const d of deposits as Array<{ userId: number; amount: string }>) depByUser.set(d.userId, (depByUser.get(d.userId) || 0n) + BigInt(d.amount || "0"));
  const profRegByUser = new Map<number, bigint>();
  const profWByUser = new Map<number, bigint>();
  for (const p of profits as Array<{ userId: number; amount: string; withdrawn: boolean }>) {
    profRegByUser.set(p.userId, (profRegByUser.get(p.userId) || 0n) + BigInt(p.amount || "0"));
    if (p.withdrawn) profWByUser.set(p.userId, (profWByUser.get(p.userId) || 0n) + BigInt(p.amount || "0"));
  }
  const capByUser = new Map<number, bigint>();
  for (const w of withdrawals as Array<{ userId: number; amount: string }>) capByUser.set(w.userId, (capByUser.get(w.userId) || 0n) + BigInt(w.amount || "0"));
  const refByUser = new Map<number, string>();
  const usersById = new Map<number, string>();
  for (const u of users as Array<{ id: number; address: string }>) usersById.set(u.id, u.address);
  for (const a of affiliates as Array<{ userId: number; referrerId: number }>) refByUser.set(a.userId, usersById.get(a.referrerId) || "");

  const rows: string[] = [];
  rows.push(["user_address", "total_deposits_smallest", "total_profits_registered_smallest", "total_profits_withdrawn_smallest", "total_capital_withdrawn_smallest", "referrer_address", "deposits_usdc", "profits_registered_usdc", "profits_withdrawn_usdc", "capital_withdrawn_usdc"].join(","));
  for (const u of users as Array<{ id: number; address: string }>) {
    const dep = depByUser.get(u.id) || 0n;
    const preg = profRegByUser.get(u.id) || 0n;
    const pwith = profWByUser.get(u.id) || 0n;
    const cap = capByUser.get(u.id) || 0n;
    const ref = refByUser.get(u.id) || "";
    rows.push([
      u.address,
      dep.toString(),
      preg.toString(),
      pwith.toString(),
      cap.toString(),
      ref,
      toDecimal6(dep.toString()),
      toDecimal6(preg.toString()),
      toDecimal6(pwith.toString()),
      toDecimal6(cap.toString()),
    ].join(","));
  }

  const csv = rows.join("\n");
  const filename = `users-${Date.now()}.csv`;
  await db.auditLog.create({ data: { action: "EXPORT_USERS_CSV", status: "EXECUTED", details: { rows: rows.length } } });
  return { success: true, filename, csv } as const;
});