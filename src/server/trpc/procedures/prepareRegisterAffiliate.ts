import { z } from "zod";
import { adminProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { buildRegisterAffiliateCalldata } from "~/server/utils/onchain";

export const prepareRegisterAffiliate = adminProcedure
  .input(z.object({ userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), affiliateAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }))
  .mutation(async ({ input }) => {
    const to = env.FACTORY_ADDRESS as string;
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const preparedTx = { to, data: buildRegisterAffiliateCalldata(input.userAddress, input.affiliateAddress), value: "0x0", chainId } as const;
    return { success: true, preparedTx };
  });
