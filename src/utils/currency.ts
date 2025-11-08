import axios from "redaxios";
import { useQuery } from "@tanstack/react-query";

export type EthUsdPrice = number;

export async function fetchEthUsdPrice(): Promise<EthUsdPrice> {
  // Using Coinbase rates API for simplicity
  const res = await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
  const usdStr = res.data?.data?.rates?.USD;
  const usd = usdStr ? Number(usdStr) : NaN;
  if (!usd || Number.isNaN(usd)) {
    throw new Error("Failed to fetch ETH→USD price");
  }
  return usd;
}

export function useEthUsdPrice() {
  return useQuery({
    queryKey: ["eth-usd-price"],
    queryFn: fetchEthUsdPrice,
    // Refresh occasionally to keep price sensible
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000,
  });
}

export function formatWeiToUSD(wei: string, ethUsd: number): string {
  const ether = Number(BigInt(wei)) / 1e18;
  const usd = ether * ethUsd;
  return usd.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function weiToUsdNumber(wei: string, ethUsd: number): number {
  const ether = Number(BigInt(wei)) / 1e18;
  return ether * ethUsd;
}