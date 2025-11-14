import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { StatCard } from "~/components/StatCard";
import { PerformanceChart } from "~/components/PerformanceChart";
import { DepositModal } from "~/components/DepositModal";
import { WithdrawModal } from "~/components/WithdrawModal";
import { useTRPC } from "~/trpc/react";
import { useWalletStore } from "~/stores/walletStore";
import { formatTokenAmount, useEthUsdPrice, formatUSDValue, tokenAmountToNumber, weiToUsdNumber } from "~/utils/currency";
import {
  DollarSign,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const trpc = useTRPC();
  const { address, isConnected } = useWalletStore();
  const ethUsdQuery = useEthUsdPrice();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const userDashboardQuery = useQuery(
    trpc.getUserDashboard.queryOptions(
      { userAddress: address || "0x0000000000000000000000000000000000000000" },
      { enabled: isConnected && !!address }
    )
  );

  const exportUserCsvMutation = useMutation(
    trpc.exportUserCSV.mutationOptions({
      onSuccess: (res) => {
        if (!res.success) { toast.error("User not found"); return; }
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV scaricato");
      },
      onError: (error) => { toast.error(error.message || "Export failed"); }
    })
  );

  const affiliateStatsQuery = useQuery(
    trpc.getAffiliateStats.queryOptions(
      { userAddress: address || "0x0000000000000000000000000000000000000000" },
      { enabled: isConnected && !!address }
    )
  );
  const chainInfoQuery = useQuery(
    trpc.getChainInfo.queryOptions(
      undefined,
      { enabled: isConnected && !!address }
    )
  );

  const isStable = (symbol?: string) => {
    const s = (symbol || "").toUpperCase();
    return s.includes("USDC") || s.includes("USDT") || s.includes("DAI") || s.includes("USDCE") || s.includes("BUSD");
  };

  const toUsdNumber = (amount: string, symbol?: string): number => {
    const s = (symbol || "").toUpperCase();
    if (isStable(s)) return tokenAmountToNumber(amount, 6);
    if (s.includes("ETH")) return ethUsdQuery.data ? weiToUsdNumber(amount, ethUsdQuery.data) : 0;
    // Default fallback
    return tokenAmountToNumber(amount, 6);
  };

  const formatAmount = (amount: string, decimals: number = 6) => formatTokenAmount(amount, decimals);

  const chainMinThresholdUSD = (chainId?: number) => {
    if (!chainId) return 0.5;
    const map: Record<number, number> = { 8453: 0.25, 10: 0.4, 42161: 0.35, 137: 0.3 };
    return map[chainId] ?? 0.5;
  };
  const chainId = chainInfoQuery.data?.chainId;

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Wallet className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Connect Your Wallet</h2>
            <p className="mb-8 text-gray-600">
              Please connect your wallet to view your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dashboard = userDashboardQuery.data;

  // Derived USD totals computed per token symbol
  const totalDepositedUSD = formatUSDValue(
    (dashboard?.deposits || []).reduce((sum: number, d: any) => sum + toUsdNumber(d.amount, d.vaultSymbol), 0)
  );
  const totalProfitsUSD = formatUSDValue(
    (dashboard?.profits || []).reduce((sum: number, p: any) => sum + toUsdNumber(p.amount, p.vaultSymbol), 0)
  );
  const availableProfitsUSD = formatUSDValue(
    (dashboard?.profits || []).filter((p: any) => !p.withdrawn).reduce((sum: number, p: any) => sum + toUsdNumber(p.amount, p.vaultSymbol), 0)
  );
  const withdrawnProfitsUSD = formatUSDValue(
    (dashboard?.profits || []).filter((p: any) => p.withdrawn).reduce((sum: number, p: any) => sum + toUsdNumber(p.amount, p.vaultSymbol), 0)
  );
  const totalWithdrawnCapitalUSD = formatUSDValue(
    (dashboard?.withdrawals || []).reduce((sum: number, w: any) => sum + toUsdNumber(w.amount, w.vaultSymbol), 0)
  );
  const availablePrincipalUSD = formatUSDValue(
    ((dashboard?.deposits || []).reduce((sum: number, d: any) => sum + toUsdNumber(d.amount, d.vaultSymbol), 0)) -
    ((dashboard?.withdrawals || []).reduce((sum: number, w: any) => sum + toUsdNumber(w.amount, w.vaultSymbol), 0))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's an overview of your investments
          </p>
        </div>

        {userDashboardQuery.isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <ArrowDownCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">Deposit</h3>
                    <p className="text-indigo-100">Add funds to a vault</p>
                  </div>
                  <ArrowDownCircle className="h-8 w-8 text-white/50 transition-all group-hover:text-white" />
                </div>
              </button>

              <button
                onClick={() => {
                  const availableProfits = dashboard?.profits.filter((p: any) => !p.withdrawn) || [];
                  if (availableProfits.length === 0) {
                    toast.error("No profits available to withdraw");
                  } else {
                    setIsWithdrawModalOpen(true);
                  }
                }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-between">
                  <div className="text-left">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <ArrowUpCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">Withdraw</h3>
                    <p className="text-green-100">Claim your profits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-100">Available</p>
                    <p className="text-xl font-bold text-white">
                      ${availableProfitsUSD}
                    </p>
                  </div>
                </div>
              </button>

              <Link
                to="/vaults"
                search={{ filter: "deposited" }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-8 shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-between">
                  <div className="text-left">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg:white/20 backdrop-blur-sm">
                      <ArrowUpCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">Withdraw Capital</h3>
                    <p className="text-teal-100">Withdraw capital from your vault</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-teal-100">Available</p>
                    <p className="text-xl font-bold text-white">
                      ${availablePrincipalUSD}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => {
                  if (!address) { toast.error("Wallet non connesso"); return; }
                  exportUserCsvMutation.mutate({ address });
                }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-between">
                  <div className="text-left">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">Scarica il mio CSV</h3>
                    <p className="text-indigo-100">Trasparenza dei tuoi dati</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={DollarSign}
                label="Total Deposited"
                value={`$${totalDepositedUSD}`}
                gradient="from-blue-500 to-indigo-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Profits"
                value={`$${totalProfitsUSD}`}
                gradient="from-green-500 to-emerald-600"
              />
              <StatCard
                icon={ArrowUpCircle}
                label="Available to Withdraw"
                value={`$${availableProfitsUSD}`}
                subValue="Ready to claim"
                gradient="from-purple-500 to-pink-600"
              />
              <StatCard
                icon={CheckCircle}
                label="Withdrawn"
                value={`$${withdrawnProfitsUSD}`}
                gradient="from-orange-500 to-red-600"
              />
              <StatCard
                icon={DollarSign}
                label="Available Principal"
                value={`$${availablePrincipalUSD}`}
                gradient="from-cyan-500 to-teal-600"
              />
              <StatCard
                icon={XCircle}
                label="Capital Withdrawn"
                value={`$${totalWithdrawnCapitalUSD}`}
                gradient="from-teal-500 to-cyan-600"
              />
            </div>

            {/* Performance Chart */}
            <div className="mb-8">
              <PerformanceChart data={dashboard?.performanceData || []} />
            </div>

            {/* Affiliate Link */}
            {dashboard?.hasAffiliate && (
              <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Affiliate Program</h3>
                      <p className="text-indigo-100">You're earning rewards from referrals</p>
                    </div>
                  </div>
                  <Link
                    to="/affiliates"
                    className="flex items-center space-x-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50"
                  >
                    <span>View Stats</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Deposits */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-6 flex items-center space-x-2 text-xl font-bold text-gray-900">
                  <ArrowDownCircle className="h-6 w-6 text-indigo-600" />
                  <span>Recent Deposits</span>
                </h3>
                {dashboard && dashboard.deposits.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.deposits.slice(0, 5).map((deposit: any) => (
                      <div
                        key={deposit.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{deposit.vaultSymbol} Vault</p>
                          <p className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(deposit.createdAt).toLocaleString()}</span>
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {isStable(deposit.vaultSymbol)
                            ? `$${formatUSDValue(tokenAmountToNumber(deposit.amount, 6))}`
                            : `${formatTokenAmount(deposit.amount, deposit.vaultSymbol?.toUpperCase().includes("ETH") ? 18 : 6)} ${deposit.vaultSymbol}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ArrowDownCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No deposits yet</p>
                    <button
                      onClick={() => setIsDepositModalOpen(true)}
                      className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Make your first deposit →
                    </button>
                  </div>
                )}
              </div>

              {/* Profits & Withdrawals */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-6 flex items-center space-x-2 text-xl font-bold text-gray-900">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span>Profits & Withdrawals</span>
                </h3>
                {dashboard && dashboard.profits.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.profits.slice(0, 5).map((profit: any) => (
                      <div
                        key={profit.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{profit.vaultSymbol} Vault</p>
                          <p className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(profit.createdAt).toLocaleString()}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {isStable(profit.vaultSymbol)
                              ? `$${formatUSDValue(tokenAmountToNumber(profit.amount, 6))}`
                              : `${formatTokenAmount(profit.amount, profit.vaultSymbol?.toUpperCase().includes("ETH") ? 18 : 6)} ${profit.vaultSymbol}`}
                          </p>
                          {profit.withdrawn ? (
                            <span className="flex items-center space-x-1 text-xs text-gray-500">
                              <CheckCircle className="h-3 w-3" />
                              <span>Withdrawn</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-xs text-green-600">
                              <XCircle className="h-3 w-3" />
                              <span>Available</span>
                            </span>
                          )}
                          {!profit.withdrawn && (() => {
                            const isStableTokenLocal = /^(USDC|USDT|BUSD|DAI)$/i.test(profit.vaultSymbol || "");
                            const tokens = isStableTokenLocal ? tokenAmountToNumber(profit.amount, 6) : tokenAmountToNumber(profit.amount, profit.vaultSymbol?.toUpperCase().includes("ETH") ? 18 : 6);
                            const usd = isStableTokenLocal ? tokens : undefined;
                            const threshold = chainMinThresholdUSD(chainId);
                            if (typeof usd === 'number' && usd < threshold) {
                              return (
                                <div className="mt-1 text-xs text-indigo-600">
                                  Batching: withdraw when ≥ ${threshold} USD
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No profits yet</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Profits will appear here as your investments grow
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold text-gray-900">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Affiliate Earnings</span>
                </h3>
                {affiliateStatsQuery.data ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="font-semibold text-gray-900">${formatUSDValue(tokenAmountToNumber(affiliateStatsQuery.data.totalEarnings, 6))}</span>
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
                      <span className="font-medium">Batching:</span>
                      <span className="ml-1">Withdraw when ≥ ${chainMinThresholdUSD(10)}</span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          try {
                            const res = await trpc.requestWithdrawAffiliateEarnings.mutate({ userAddress: address! });
                            toast.success("Affiliate withdrawal requested");
                          } catch (e: any) {
                            toast.error(e.message || "Cannot request affiliate withdrawal");
                          }
                        }}
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Request Withdrawal
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No affiliate data</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
      />
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)}
        profits={dashboard?.profits || []}
      />
    </div>
  );
}
