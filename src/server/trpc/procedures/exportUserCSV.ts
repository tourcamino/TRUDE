import { z } from "zod";
import { baseProcedure } from "../../../server/trpc/main.ts";
import { db } from "../../../server/db.ts";

function toDecimal6(s: string) {
  const v = (BigInt(s || "0") * 100n) / 100n;
  const str = v.toString().padStart(7, "0");
  const int = str.slice(0, -6);
  const frac = str.slice(-6).replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

export const exportUserCSV = baseProcedure
  .input(z.object({ address: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }))
  .mutation(async ({ input }) => {
    const user = await db.user.findUnique({ where: { address: input.address.toLowerCase() } });
    if (!user) return { success: false, filename: `user-not-found-${Date.now()}.csv`, csv: "" } as const;
    const deposits = await db.deposit.findMany({ where: { userId: user.id } });
    const profits = await db.profit.findMany({ where: { userId: user.id } });
    const withdrawals = await db.capitalWithdrawal.findMany({ where: { userId: user.id } });
    const aff = await db.affiliate.findUnique({ where: { userId: user.id } });
    const ref = aff ? await db.user.findUnique({ where: { id: aff.referrerId } }) : null;

    const totalDep = deposits.reduce((acc: bigint, d: any) => acc + BigInt(d.amount || "0"), 0n);
    const totalProfReg = profits.reduce((acc: bigint, p: any) => acc + BigInt(p.amount || "0"), 0n);
    const totalProfW = profits.filter((p: any) => p.withdrawn).reduce((acc: bigint, p: any) => acc + BigInt(p.amount || "0"), 0n);
    const totalCap = withdrawals.reduce((acc: bigint, w: any) => acc + BigInt(w.amount || "0"), 0n);

    const rows: string[] = [];
    rows.push(["user_address", "referrer_address", "total_deposits_smallest", "total_profits_registered_smallest", "total_profits_withdrawn_smallest", "total_capital_withdrawn_smallest", "deposits_usdc", "profits_registered_usdc", "profits_withdrawn_usdc", "capital_withdrawn_usdc"].join(","));
    rows.push([
      user.address,
      ref?.address || "",
      totalDep.toString(),
      totalProfReg.toString(),
      totalProfW.toString(),
      totalCap.toString(),
      toDecimal6(totalDep.toString()),
      toDecimal6(totalProfReg.toString()),
      toDecimal6(totalProfW.toString()),
      toDecimal6(totalCap.toString()),
    ].join(","));

    const csv = rows.join("\n");
    const filename = `user-${user.address}-${Date.now()}.csv`;
    await db.auditLog.create({ data: { action: "EXPORT_USER_CSV", status: "EXECUTED", userId: user.id, details: { address: user.address } } });
    return { success: true, filename, csv } as const;
  });
