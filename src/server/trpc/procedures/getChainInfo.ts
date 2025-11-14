import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getChainInfo = baseProcedure.query(async () => {
  return { success: true, chainId: env.CHAIN_ID ? Number(env.CHAIN_ID) : null };
});