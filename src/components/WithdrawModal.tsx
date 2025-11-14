import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, ArrowUpCircle, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useWalletStore } from "~/stores/walletStore";
import toast from "react-hot-toast";
import { sendPreparedTx } from "~/utils/sendPreparedTx";
import { formatTokenAmount, formatUSDValue, tokenAmountToNumber } from "~/utils/currency";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  profits: Array<{
    id: number;
    amount: string;
    withdrawn: boolean;
    createdAt: Date;
    vaultSymbol: string;
  }>;
}

export function WithdrawModal({ isOpen, onClose, profits }: WithdrawModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address } = useWalletStore();
  const [selectedProfitId, setSelectedProfitId] = useState<number | null>(null);

  const chainInfoQuery = useQuery(
    trpc.getChainInfo.queryOptions()
  );

  const withdrawMutation = useMutation(
    trpc.withdrawProfit.mutationOptions()
  );

  const finalizeMutation = useMutation(
    trpc.finalizeProfitWithdrawal.mutationOptions({
      onSuccess: () => {
        toast.success("Profit withdrawn successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getUserDashboard.queryKey() });
        setSelectedProfitId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to finalize profit withdrawal");
      },
    })
  );

  const handleWithdraw = async (profitId: number) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    setSelectedProfitId(profitId);
    try {
      const { preparedTx } = await withdrawMutation.mutateAsync({ userAddress: address, profitId });
      const txHash = await sendPreparedTx(preparedTx);
      await finalizeMutation.mutateAsync({ userAddress: address, profitId, txHash });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send transaction");
    }
  };

  const inferTokenDecimals = (symbol?: string) => {
    const s = (symbol || "").toUpperCase();
    if (s.includes("USDC") || s.includes("USDT") || s.includes("BUSD")) return 6;
    if (s.includes("DAI")) return 18;
    return 18;
  };

  const tokenPricesQuery = useQuery(
    trpc.getTokenPrices.queryOptions(
      { symbols: profits.map((p) => p.vaultSymbol) },
      { enabled: profits.length > 0 }
    )
  );
  const prices: Record<string, number> = tokenPricesQuery.data?.prices || {};
  const chainId = chainInfoQuery.data?.chainId;
  const chainMinThresholdUSD = (id?: number) => {
    const map: Record<number, number> = { 8453: 0.25, 10: 0.4, 42161: 0.35, 137: 0.3 };
    return id ? (map[id] ?? 0.5) : 0.5;
  };

  const availableProfits = profits.filter(p => !p.withdrawn);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600">
                <ArrowUpCircle className="h-5 w-5 text-white" />
              </div>
              <span>Withdraw Profits</span>
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {availableProfits.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">No profits available to withdraw</p>
              <p className="mt-1 text-xs text-gray-400">
                Profits will appear here as your investments grow
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
                <span className="font-medium">Batching:</span>
                <span className="ml-1">Withdraw when ≥ ${chainMinThresholdUSD(chainId)} USD</span>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Select a profit to withdraw. Each withdrawal will be processed individually.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableProfits.map((profit) => (
                  <div
                    key={profit.id}
                    className="flex items-center justify-between rounded-xl border-2 border-gray-200 p-4 transition-all hover:border-green-300 hover:bg-green-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-semibold">
                          {profit.vaultSymbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{profit.vaultSymbol} Vault</p>
                          <p className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(profit.createdAt).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      {(() => {
                        const dec = inferTokenDecimals(profit.vaultSymbol);
                        const tokens = tokenAmountToNumber(profit.amount, dec);
                        const sym = profit.vaultSymbol || "";
                        const isStable = /^(USDC|USDT|BUSD|DAI)$/i.test(sym);
                        const price = prices[sym] ?? (isStable ? 1 : undefined);
                        const content = price
                          ? `$${formatUSDValue(tokens * price)}`
                          : `${formatTokenAmount(profit.amount, dec)} ${profit.vaultSymbol}`;
                        return <p className="text-lg font-semibold text-green-600">{content}</p>;
                      })()}
                    </div>
                    <button
                      onClick={() => handleWithdraw(profit.id)}
                      disabled={(((withdrawMutation.isPending || finalizeMutation.isPending) && selectedProfitId === profit.id)) || (() => {
                        const dec = inferTokenDecimals(profit.vaultSymbol);
                        const tokens = tokenAmountToNumber(profit.amount, dec);
                        const sym = profit.vaultSymbol || "";
                        const isStable = /^(USDC|USDT|BUSD|DAI)$/i.test(sym);
                        const price = prices[sym] ?? (isStable ? 1 : undefined);
                        const usdVal = price ? (tokens * price) : 0;
                        return usdVal < chainMinThresholdUSD(chainId);
                      })()}
                      className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                    >
                      {(withdrawMutation.isPending || finalizeMutation.isPending) && selectedProfitId === profit.id
                        ? "Processing..."
                        : "Withdraw"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-green-50 p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-900 mb-2">💰 Zero Fee Withdrawals</h4>
                <p className="text-sm text-green-800 mb-2">
                  🎉 No withdrawal fees! You keep 100% of your profits.
                </p>
                <p className="text-xs text-green-700">
                  Only standard blockchain gas fees apply. All profits are yours to keep.
                </p>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
