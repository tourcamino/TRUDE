import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, ArrowDownCircle, Vault, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useWalletStore } from "~/stores/walletStore";
import toast from "react-hot-toast";
import { formatTokenAmount, formatUSDValue } from "~/utils/currency";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const depositSchema = z.object({
  vaultId: z.number().min(1, "Please select a vault"),
  amountDecimal: z
    .string()
    .regex(/^\d+(\.\d{1,18})?$/, "Enter a valid amount (e.g., 10 or 10.5)")
    .min(1, "Amount is required"),
});

type DepositForm = z.infer<typeof depositSchema>;

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address } = useWalletStore();
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);

  const vaultsQuery = useQuery(
    trpc.getVaults.queryOptions({ limit: 20 })
  );

  const createDepositMutation = useMutation(
    trpc.createDeposit.mutationOptions({
      onSuccess: () => {
        toast.success("Deposit successful!");
        queryClient.invalidateQueries({ queryKey: trpc.getUserDashboard.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey() });
        onClose();
        reset();
        setSelectedVaultId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to deposit");
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
  });

  const inferTokenDecimals = (symbol?: string) => {
    const s = (symbol || "").toUpperCase();
    if (s.includes("USDC") || s.includes("USDT") || s.includes("BUSD")) return 6;
    if (s.includes("DAI")) return 18;
    return 18;
  };

  const toSmallestUnits = (amountDecimal: string, decimals: number) => {
    const [intPart, fracPart = ""] = amountDecimal.split(".");
    const cleanedInt = (intPart || "0").replace(/\D/g, "");
    const frac = fracPart.padEnd(decimals, "0").slice(0, decimals);
    const normalized = `${cleanedInt}${frac}`;
    const trimmed = normalized.replace(/^0+/, "") || "0";
    return trimmed;
  };

  const onSubmit = (data: DepositForm) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    const decimals = inferTokenDecimals(selectedVault?.tokenSymbol);
    const smallest = toSmallestUnits(data.amountDecimal, decimals);
    createDepositMutation.mutate({
      userAddress: address,
      vaultId: data.vaultId,
      amount: smallest,
    });
  };

  const handleVaultSelect = (vaultId: number) => {
    setSelectedVaultId(vaultId);
    setValue("vaultId", vaultId);
  };

  // Use centralized formatter from utils/currency

  const availableVaults = vaultsQuery.data?.vaults.filter(v => !v.isPaused) || [];
  const tokenPricesQuery = useQuery(
    trpc.getTokenPrices.queryOptions(
      { symbols: availableVaults.map((v) => v.tokenSymbol) },
      { enabled: availableVaults.length > 0 }
    )
  );
  const prices: Record<string, number> = tokenPricesQuery.data?.prices || {};
  const selectedVault = availableVaults.find(v => v.id === selectedVaultId);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                <ArrowDownCircle className="h-5 w-5 text-white" />
              </div>
              <span>Deposit Funds</span>
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {vaultsQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
              ))}
            </div>
          ) : availableVaults.length === 0 ? (
            <div className="py-12 text-center">
              <Vault className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">No vaults available for deposit</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Vault Selection */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Select Vault
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableVaults.map((vault) => (
                    <button
                      key={vault.id}
                      type="button"
                      onClick={() => handleVaultSelect(vault.id)}
                      className={`w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                        selectedVaultId === vault.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                          {vault.tokenSymbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{vault.tokenSymbol} Vault</div>
                          <div className="text-xs text-gray-500">
                            TVL: {formatTokenAmount(vault.totalValueLocked)} {vault.tokenSymbol}
                          </div>
                        </div>
                      </div>
                      {selectedVaultId === vault.id && (
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register("vaultId", { valueAsNumber: true })} />
                {errors.vaultId && (
                  <p className="mt-2 text-sm text-red-600">{errors.vaultId.message}</p>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="amountDecimal" className="mb-1 block text-sm font-medium text-gray-700">
                  Deposit Amount ({selectedVault?.tokenSymbol || "Token"})
                </label>
                <input
                  id="amountDecimal"
                  type="text"
                  placeholder="e.g., 10 or 10.5"
                  {...register("amountDecimal")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.amountDecimal && (
                  <p className="mt-1 text-sm text-red-600">{errors.amountDecimal.message}</p>
                )}
                {selectedVault && (() => {
                  const amountDec = watch("amountDecimal") || "";
                  const decimals = inferTokenDecimals(selectedVault.tokenSymbol);
                  const smallest = amountDec && /^\d+(\.\d+)?$/.test(amountDec)
                    ? toSmallestUnits(amountDec, decimals)
                    : "";
                  const sym = selectedVault?.tokenSymbol || "";
                  const isStable = /^(USDC|USDT|BUSD|DAI)$/i.test(sym);
                  const tokenUsdPrice = prices[sym] ?? (isStable ? 1 : undefined);
                  const usd = amountDec && !isNaN(Number(amountDec)) && tokenUsdPrice
                    ? formatUSDValue(Number(amountDec) * tokenUsdPrice)
                    : "";
                  return (
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                        <span className="font-medium">≈ USD:</span> {usd ? `$${usd}` : "-"}
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                        <span className="font-medium">Smallest unit:</span> {smallest || "-"}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Fee Information */}
              {selectedVault && (
                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">📊 Fee Structure</h4>
                  <div className="space-y-1 text-xs text-green-800">
                    <div className="flex justify-between">
                      <span>Deposit Fee:</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance Fee:</span>
                      <span className="font-medium">10-30% (dynamic)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Withdrawal Fee:</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-xs text-green-700">
                        💡 Performance fees are only charged on profits. No fees on deposits or withdrawals.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createDepositMutation.isPending || !selectedVaultId}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {createDepositMutation.isPending ? "Processing..." : "Deposit"}
              </button>
            </form>
          )}

          <div className="mt-6 rounded-lg bg-indigo-50 p-4">
            <p className="text-sm text-indigo-900">
              Your deposit will be processed on-chain. Make sure you have sufficient balance and gas fees.
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
