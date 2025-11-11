import { z } from "zod";
import axios from "redaxios";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";

// Simple live USD price fetcher using CoinGecko simple price API.
// Maps common symbols to CoinGecko IDs.
const COINGECKO_IDS: Record<string, string> = {
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  BUSD: "binance-usd",
  ETH: "ethereum",
  WETH: "weth",
  WBTC: "wrapped-bitcoin",
  ARB: "arbitrum",
  OP: "optimism",
};

export const getTokenPrices = baseProcedure
  .input(
    z
      .object({
        symbols: z.array(z.string()).optional(),
      })
      .optional()
  )
  .query(async ({ input }) => {
    const symbols = (input?.symbols && input.symbols.length > 0)
      ? input.symbols.map((s) => s.toUpperCase())
      : ["USDC", "USDT", "DAI", "ETH", "WBTC", "ARB", "OP"]; // default set ampliato

    const ids = symbols
      .map((s) => COINGECKO_IDS[s])
      .filter(Boolean);

    if (ids.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No supported symbols provided" });
    }

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`;
      const res = await axios.get(url);
      const data = res.data as Record<string, { usd: number }>;

      const prices: Record<string, number> = {};
      for (const [sym, id] of Object.entries(COINGECKO_IDS)) {
        if (symbols.includes(sym) && data[id] && typeof data[id].usd === "number") {
          prices[sym] = data[id].usd;
        }
      }

      return { prices };
    } catch (err) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch live prices" });
    }
  });