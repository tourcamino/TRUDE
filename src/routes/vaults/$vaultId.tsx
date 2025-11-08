import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { useTRPC } from "~/trpc/react";
import {
  Vault,
  TrendingUp,
  Users,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/vaults/$vaultId")({
  component: VaultDetailPage,
});

const depositSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  amount: z.string().regex(/^\d+$/, "Amount must be a valid number"),
});

const profitSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  profitAmount: z.string().regex(/^\d+$/, "Amount must be a valid number"),
});

type DepositForm = z.infer<typeof depositSchema>;
type ProfitForm = z.infer<typeof profitSchema>;

function VaultDetailPage() {
  const { vaultId } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"deposit" | "profit">("deposit");

  const vaultQuery = useQuery(
    trpc.getVaultById.queryOptions({ vaultId: parseInt(vaultId) })
  );

  const createDepositMutation = useMutation(
    trpc.createDeposit.mutationOptions({
      onSuccess: () => {
        toast.success("Deposit successful!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        depositReset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to deposit");
      },
    })
  );

  const registerProfitMutation = useMutation(
    trpc.registerProfit.mutationOptions({
      onSuccess: () => {
        toast.success("Profit registered successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        profitReset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register profit");
      },
    })
  );

  const {
    register: depositRegister,
    handleSubmit: handleDepositSubmit,
    formState: { errors: depositErrors },
    reset: depositReset,
  } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
  });

  const {
    register: profitRegister,
    handleSubmit: handleProfitSubmit,
    formState: { errors: profitErrors },
    reset: profitReset,
  } = useForm<ProfitForm>({
    resolver: zodResolver(profitSchema),
  });

  const onDepositSubmit = (data: DepositForm) => {
    createDepositMutation.mutate({
      ...data,
      vaultId: parseInt(vaultId),
    });
  };

  const onProfitSubmit = (data: ProfitForm) => {
    registerProfitMutation.mutate({
      ...data,
      vaultId: parseInt(vaultId),
    });
  };

  const formatTokenAmount = (amount: string, decimals: number = 18) => {
    // Handle different token decimals (e.g., USDC=6, DAI=18)
    const divisor = BigInt(10 ** decimals);
    const value = Number(BigInt(amount) / divisor);
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  // For display purposes, assume 6 decimals for stablecoins (USDC, USDT)
  // This can be made dynamic by storing decimals in the vault model
  const formatAmount = (amount: string) => formatTokenAmount(amount, 6);

  const vault = vaultQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {vaultQuery.isLoading ? (
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-2xl bg-gray-200"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-96 animate-pulse rounded-2xl bg-gray-200"></div>
              <div className="h-96 animate-pulse rounded-2xl bg-gray-200"></div>
            </div>
          </div>
        ) : vault ? (
          <>
            {/* Vault Header */}
            <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Vault className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">{vault.tokenSymbol} Vault</h1>
                    <p className="mt-1 text-indigo-100">
                      {vault.address.slice(0, 16)}...{vault.address.slice(-12)}
                    </p>
                  </div>
                </div>
                {vault.isPaused && (
                  <div className="flex items-center space-x-2 rounded-full bg-red-500 px-4 py-2">
                    <AlertCircle className="h-5 w-5 text-white" />
                    <span className="font-semibold text-white">Paused</span>
                  </div>
                )}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-indigo-200">Total Value Locked</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatAmount(vault.totalValueLocked)} {vault.tokenSymbol}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-indigo-200">Total Deposits</p>
                  <p className="mt-1 text-2xl font-bold text-white">{vault.deposits.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-indigo-200">Total Profits</p>
                  <p className="mt-1 text-2xl font-bold text-white">{vault.profits.length}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Actions Panel */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex space-x-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("deposit")}
                    className={`flex items-center space-x-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === "deposit"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ArrowDownCircle className="h-5 w-5" />
                    <span>Deposit</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("profit")}
                    className={`flex items-center space-x-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === "profit"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ArrowUpCircle className="h-5 w-5" />
                    <span>Register Profit</span>
                  </button>
                </div>

                {activeTab === "deposit" ? (
                  <form onSubmit={handleDepositSubmit(onDepositSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="userAddress" className="mb-1 block text-sm font-medium text-gray-700">
                        User Address
                      </label>
                      <input
                        id="userAddress"
                        type="text"
                        placeholder="0x..."
                        {...depositRegister("userAddress")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {depositErrors.userAddress && (
                        <p className="mt-1 text-sm text-red-600">{depositErrors.userAddress.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
                        Amount (smallest unit)
                      </label>
                      <input
                        id="amount"
                        type="text"
                        placeholder="10000000"
                        {...depositRegister("amount")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {depositErrors.amount && (
                        <p className="mt-1 text-sm text-red-600">{depositErrors.amount.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        For {vault.tokenSymbol}: Enter amount in smallest unit (e.g., 10 {vault.tokenSymbol} = 10000000 for 6 decimals)
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={createDepositMutation.isPending || vault.isPaused}
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                    >
                      {createDepositMutation.isPending ? "Processing..." : "Deposit"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleProfitSubmit(onProfitSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="profitUserAddress" className="mb-1 block text-sm font-medium text-gray-700">
                        User Address
                      </label>
                      <input
                        id="profitUserAddress"
                        type="text"
                        placeholder="0x..."
                        {...profitRegister("userAddress")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {profitErrors.userAddress && (
                        <p className="mt-1 text-sm text-red-600">{profitErrors.userAddress.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profitAmount" className="mb-1 block text-sm font-medium text-gray-700">
                        Profit Amount (smallest unit)
                      </label>
                      <input
                        id="profitAmount"
                        type="text"
                        placeholder="5000000"
                        {...profitRegister("profitAmount")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {profitErrors.profitAmount && (
                        <p className="mt-1 text-sm text-red-600">{profitErrors.profitAmount.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        For {vault.tokenSymbol}: Enter amount in smallest unit (e.g., 5 {vault.tokenSymbol} = 5000000 for 6 decimals)
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={registerProfitMutation.isPending || vault.isPaused}
                      className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                    >
                      {registerProfitMutation.isPending ? "Processing..." : "Register Profit"}
                    </button>
                  </form>
                )}
              </div>

              {/* Activity Panel */}
              <div className="space-y-6">
                {/* Recent Deposits */}
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold text-gray-900">
                    <ArrowDownCircle className="h-5 w-5 text-indigo-600" />
                    <span>Recent Deposits</span>
                  </h3>
                  {vault.deposits.length > 0 ? (
                    <div className="space-y-3">
                      {vault.deposits.map((deposit) => (
                        <div key={deposit.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {deposit.user.address.slice(0, 10)}...{deposit.user.address.slice(-8)}
                            </p>
                            <p className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(deposit.createdAt).toLocaleString()}</span>
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatAmount(deposit.amount)} {vault.tokenSymbol}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500">No deposits yet</p>
                  )}
                </div>

                {/* Recent Profits */}
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold text-gray-900">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Recent Profits</span>
                  </h3>
                  {vault.profits.length > 0 ? (
                    <div className="space-y-3">
                      {vault.profits.map((profit) => (
                        <div key={profit.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {profit.user.address.slice(0, 10)}...{profit.user.address.slice(-8)}
                            </p>
                            <p className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(profit.createdAt).toLocaleString()}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{formatAmount(profit.amount)} {vault.tokenSymbol}</p>
                            {profit.withdrawn && (
                              <span className="text-xs text-gray-500">Withdrawn</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500">No profits registered yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Vault className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Vault not found</h3>
            <p className="text-gray-600">The vault you're looking for doesn't exist</p>
          </div>
        )}
      </div>
    </div>
  );
}
