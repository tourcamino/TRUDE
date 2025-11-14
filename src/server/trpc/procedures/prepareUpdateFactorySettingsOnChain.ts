import { z } from "zod";
import { adminProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { buildSetMinDepositCalldata, buildSetAffiliateShareBpsCalldata, buildSetMaxFeePercentCalldata } from "~/server/utils/onchain";

export const prepareUpdateFactorySettingsOnChain = adminProcedure
  .input(z.object({
    minDeposit: z.string().regex(/^\d+$/).optional(),
    affiliateShareBps: z.number().int().min(0).max(10000).optional(),
    maxFeePercent: z.number().int().min(0).max(100).optional(),
  }))
  .mutation(async ({ input }) => {
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const to = env.FACTORY_ADDRESS as string;
    if (!to) return { success: false, prepared: [] };
    const prepared = [] as Array<{ to: string; data: string; value: string; chainId?: number }>;
    if (input.minDeposit) prepared.push({ to, data: buildSetMinDepositCalldata(BigInt(input.minDeposit)), value: "0x0", chainId });
    if (typeof input.affiliateShareBps === "number") prepared.push({ to, data: buildSetAffiliateShareBpsCalldata(input.affiliateShareBps), value: "0x0", chainId });
    if (typeof input.maxFeePercent === "number") prepared.push({ to, data: buildSetMaxFeePercentCalldata(input.maxFeePercent), value: "0x0", chainId });
    return { success: true, prepared };
  });
