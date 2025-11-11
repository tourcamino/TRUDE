import { db } from "~/server/db";

type Policy = {
  allowlist?: string[]; // vault addresses allowed
  maxPerTx?: string; // string amount in smallest units
  dailyLimit?: string; // string amount per day
  custodial?: boolean; // if true, delegatedSigner controls the user's wallet
};

export async function getActiveDelegationForUser(userId: number) {
  const del = await db.serviceDelegation.findFirst({ where: { userId, status: "ACTIVE" } });
  return del;
}

export function parsePolicy(policyJson: unknown): Policy {
  if (!policyJson || typeof policyJson !== "object") return {};
  return policyJson as Policy;
}

export async function enforcePolicy({
  userId,
  vaultAddress,
  amount,
}: { userId: number; vaultAddress: string; amount: bigint }) {
  const delegation = await getActiveDelegationForUser(userId);
  if (!delegation) return { ok: false, reason: "NO_DELEGATION" } as const;
  const policy = parsePolicy(delegation.policy);

  // allowlist
  if (policy.allowlist && policy.allowlist.length > 0) {
    if (!policy.allowlist.some((a) => a.toLowerCase() === vaultAddress.toLowerCase())) {
      return { ok: false, reason: "VAULT_NOT_ALLOWED" } as const;
    }
  }

  // per tx limit
  if (policy.maxPerTx) {
    const max = BigInt(policy.maxPerTx);
    if (amount > max) return { ok: false, reason: "AMOUNT_EXCEEDS_MAX_PER_TX" } as const;
  }

  // daily limit (sum executed today)
  if (policy.dailyLimit) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const executed = await db.withdrawalRequest.findMany({
      where: {
        userId,
        status: "EXECUTED",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: { amount: true },
    });
    const total = executed.reduce((acc: bigint, r: { amount: string }) => acc + BigInt(r.amount), 0n) + amount;
    const maxDaily = BigInt(policy.dailyLimit);
    if (total > maxDaily) return { ok: false, reason: "DAILY_LIMIT_EXCEEDED" } as const;
  }

  return { ok: true, delegatedSigner: delegation.delegatedSigner, custodial: !!policy.custodial } as const;
}