import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { JsonRpcProvider } from "ethers";
import { fetchVaultEvents } from "~/server/onchain/events";

export const getVaultEvents = baseProcedure
  .input(z.object({ vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), fromBlock: z.number().int().nonnegative().optional(), toBlock: z.number().int().nonnegative().optional() }))
  .query(async ({ input }) => {
    const provider = new JsonRpcProvider(env.CHAIN_RPC_URL || "http://127.0.0.1:8545");
    const latest = await provider.getBlockNumber();
    const from = input.fromBlock ?? Math.max(0, latest - 5000);
    const to = input.toBlock ?? latest;
    const events = await fetchVaultEvents(provider, input.vaultAddress, from, to);
    return { success: true, fromBlock: from, toBlock: to, events };
  });
