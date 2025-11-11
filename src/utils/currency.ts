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
  return usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function weiToUsdNumber(wei: string, ethUsd: number): number {
  const ether = Number(BigInt(wei)) / 1e18;
  return ether * ethUsd;
}

// Standard USD formatter for numeric values
export function formatUSDValue(usd: number): string {
  return usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format USD from ETH wei using price
export function formatUSDFromWei(wei: string, ethUsd: number): string {
  const usd = weiToUsdNumber(wei, ethUsd);
  return formatUSDValue(usd);
}

// Convert token smallest units to a human number
export function tokenAmountToNumber(amount: string, decimals: number = 6): number {
  const divisor = BigInt("1" + "0".repeat(decimals));
  return Number(BigInt(amount)) / Number(divisor);
}

// Format token amount with consistent fraction digits
export function formatTokenAmount(amount: string, decimals: number = 6): string {
  const num = tokenAmountToNumber(amount, decimals);
  return num.toLocaleString(undefined, { maximumFractionDigits: Math.min(decimals, 6) });
}

// Format ETH from wei with consistent fraction digits (default 4)
export function formatEthFromWei(wei: string, maxFractionDigits: number = 4): string {
  const ether = Number(BigInt(wei)) / 1e18;
  return ether.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
}