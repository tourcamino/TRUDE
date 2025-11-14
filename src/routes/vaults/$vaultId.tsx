import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { setPageTitle } from "~/utils/seo";
import { useTRPC } from "~/trpc/react";
import { useWalletStore } from "~/stores/walletStore";
import { sendPreparedTx } from "~/utils/sendPreparedTx";
import { formatTokenAmount, formatUSDValue, useEthUsdPrice } from "~/utils/currency";
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

type VaultData = {
  tokenSymbol: string;
  address: string;
  isPaused: boolean;
  totalValueLocked: string;
  deposits: any[];
  profits: any[];
  withdrawals: any[];
};

const depositSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  amountDecimal: z.string().regex(/^\d+(\.\d{1,18})?$/, "Enter a valid amount (e.g., 10 or 10.5)"),
});

const profitSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  profitAmountDecimal: z.string().regex(/^\d+(\.\d{1,18})?$/, "Enter a valid amount (e.g., 10 or 10.5)"),
});

const withdrawSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  amountDecimal: z.string().regex(/^\d+(\.\d{1,18})?$/, "Enter a valid amount (e.g., 10 or 10.5)"),
});

type DepositForm = z.infer<typeof depositSchema>;
type ProfitForm = z.infer<typeof profitSchema>;
type WithdrawForm = z.infer<typeof withdrawSchema>;

function VaultDetailPage() {
  const { vaultId } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const { address, isConnected } = useWalletStore();
  const ethPriceQuery = useEthUsdPrice();
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [expectedChainId, setExpectedChainId] = useState<number | null>(null);

  const vaultQuery = useQuery(
    trpc.getVaultById.queryOptions({ vaultId: parseInt(vaultId) })
  );

  // Live USD price for the current vault token
  const tokenSymbol = (vaultQuery.data as VaultData | undefined)?.tokenSymbol;
  const pricesQuery = useQuery(
    trpc.getTokenPrices.queryOptions({ symbols: tokenSymbol ? [tokenSymbol] : [] }, { enabled: !!tokenSymbol })
  );
  const tokenUsdPrice: number | undefined = tokenSymbol
    ? pricesQuery.data?.prices?.[tokenSymbol.toUpperCase()]
    : undefined;

  // Validate vault address to prevent failing prepared transactions
  const vaultAddressValid = /^0x[a-fA-F0-9]{40}$/.test(((vaultQuery.data as VaultData | undefined)?.address) || "");

  useEffect(() => {
    setPageTitle(`TRUDE • ${vault?.tokenSymbol || "Vault"}`);
    (async () => {
      try {
        const res = await fetch("/api/health");
        const json = await res.json();
        setExpectedChainId(json.chainId ?? null);
      } catch {}
      try {
        const ethereum: any = (window as any).ethereum;
        if (ethereum) {
          const hex = await ethereum.request({ method: "eth_chainId" });
          const id = typeof hex === "string" ? parseInt(hex, 16) : Number(hex);
          setWalletChainId(id);
        }
      } catch {}
    })();
  }, []);

  // Factory settings (minDeposit in smallest units)
  const factorySettingsQuery = useQuery(
    trpc.getFactorySettings.queryOptions()
  );

  const prepareDepositMutation = useMutation(
    trpc.prepareDeposit.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to prepare deposit");
      },
    })
  );

  const finalizeDepositMutation = useMutation(
    trpc.finalizeDeposit.mutationOptions({
      onSuccess: () => {
        toast.success("Deposit finalized");
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey({ vaultId: parseInt(vaultId) }) });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        depositReset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to finalize deposit");
      },
    })
  );

  const syncVaultEventsMutation = useMutation(
    trpc.syncVaultEvents.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey({ vaultId: parseInt(vaultId) }) });
      },
    })
  );

  useEffect(() => {
    const id = setInterval(() => {
      try { syncVaultEventsMutation.mutate({ vaultId: parseInt(vaultId) }); } catch {}
    }, 20000);
    return () => clearInterval(id);
  }, [vaultId]);

  const registerProfitMutation = useMutation(
    trpc.registerProfit.mutationOptions({
      onSuccess: () => {
        toast.success("Profit registered successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey({ vaultId: parseInt(vaultId) }) });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        profitReset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register profit");
      },
    })
  );

  const withdrawCapitalMutation = useMutation(
    trpc.requestWithdrawCapital.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to prepare capital withdrawal");
      },
    })
  );

  const finalizeWithdrawCapitalMutation = useMutation(
    trpc.finalizeWithdrawCapital.mutationOptions({
      onSuccess: () => {
        toast.success("Capital withdrawn successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaultById.queryKey({ vaultId: parseInt(vaultId) }) });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        withdrawReset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to finalize capital withdrawal");
      },
    })
  );

  const {
    register: depositRegister,
    handleSubmit: handleDepositSubmit,
    formState: { errors: depositErrors },
    reset: depositReset,
    watch: depositWatch,
    setValue: depositSetValue,
  } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
    defaultValues: { userAddress: address || "" },
  });

  const {
    register: profitRegister,
    handleSubmit: handleProfitSubmit,
    formState: { errors: profitErrors },
    reset: profitReset,
    watch: profitWatch,
    setValue: profitSetValue,
  } = useForm<ProfitForm>({
    resolver: zodResolver(profitSchema),
    defaultValues: { userAddress: address || "" },
  });

  const {
    register: withdrawRegister,
    handleSubmit: handleWithdrawSubmit,
    formState: { errors: withdrawErrors },
    reset: withdrawReset,
    watch: withdrawWatch,
    setValue: withdrawSetValue,
  } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { userAddress: address || "" },
  });

  const inferTokenDecimals = (symbol?: string) => {
    const s = (symbol || "").toUpperCase();
    if (s.includes("USDC") || s.includes("USDT") || s.includes("BUSD")) return 6;
    if (s.includes("DAI")) return 18;
    return 18;
  };

  const isStableToken = (symbol?: string) => {
    const s = (symbol || "").toUpperCase();
    return s.includes("USDC") || s.includes("USDT") || s.includes("BUSD") || s.includes("DAI");
  };

  const toSmallestUnits = (amountDecimal: string, decimals: number) => {
    const [intPart, fracPart = ""] = amountDecimal.split(".");
    const cleanedInt = (intPart || "0").replace(/\D/g, "");
    const frac = fracPart.padEnd(decimals, "0").slice(0, decimals);
    const normalized = `${cleanedInt}${frac}`;
    const trimmed = normalized.replace(/^0+/, "") || "0";
    return trimmed;
  };

  const formatDecimalFromSmallest = (smallest: string, decimals: number) => {
    const s = (smallest || "0").replace(/\D/g, "");
    const padded = s.padStart(decimals + 1, "0");
    const intPart = padded.slice(0, -decimals) || "0";
    const fracPartRaw = padded.slice(-decimals);
    const fracPart = fracPartRaw.replace(/0+$/, "");
    return fracPart ? `${intPart}.${fracPart}` : intPart;
  };

  const onDepositSubmit = async (data: DepositForm) => {
    if (!isConnected) { toast.error("Please connect your wallet"); return; }
    if (!vaultAddressValid) { toast.error("Vault address invalid (expected 0x + 40 hex). Please recreate the vault."); return; }
    if (expectedChainId && walletChainId && expectedChainId !== walletChainId) { toast.error(`Wrong network. Please switch to chain ${expectedChainId}`); return; }
    const decimals = inferTokenDecimals(vault?.tokenSymbol);
    const smallest = toSmallestUnits(data.amountDecimal, decimals);
    try {
      const res = await prepareDepositMutation.mutateAsync({ userAddress: data.userAddress, vaultId: parseInt(vaultId), amount: smallest });
      try {
        const ethereum: any = (window as any).ethereum;
        if (ethereum) {
          const [gasApprove, gasDeposit, gasPriceHex] = await Promise.all([
            ethereum.request({ method: "eth_estimateGas", params: [res.prepared.approveTx] }),
            ethereum.request({ method: "eth_estimateGas", params: [res.prepared.depositTx] }),
            ethereum.request({ method: "eth_gasPrice" })
          ]);
          const gasApproveDec = parseInt(String(gasApprove), 16);
          const gasDepositDec = parseInt(String(gasDeposit), 16);
          const gasPriceDec = parseInt(String(gasPriceHex), 16);
          const totalGas = gasApproveDec + gasDepositDec;
          const totalWei = BigInt(totalGas) * BigInt(gasPriceDec);
          const totalEth = Number(totalWei) / 1e18;
          const usd = ethPriceQuery.data ? (totalEth * ethPriceQuery.data).toFixed(2) : undefined;
          toast.success(`Estimated gas: approve ~${gasApproveDec}, deposit ~${gasDepositDec}${usd ? ` (≈ $${usd})` : ""}`);
        }
      } catch {}
      const approveHash = await sendPreparedTx(res.prepared.approveTx as any);
      const depositHash = await sendPreparedTx(res.prepared.depositTx as any);
      await finalizeDepositMutation.mutateAsync({ userAddress: data.userAddress, vaultId: parseInt(vaultId), amount: smallest, txHash: depositHash });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to send deposit transactions");
    }
  };

  const onProfitSubmit = (data: ProfitForm) => {
    const decimals = inferTokenDecimals(vault?.tokenSymbol);
    const smallest = toSmallestUnits(data.profitAmountDecimal, decimals);
    registerProfitMutation.mutate({
      userAddress: data.userAddress,
      vaultId: parseInt(vaultId),
      profitAmount: smallest,
    });
  };

  // Per la visualizzazione TVL in token, usiamo 6 decimali di default (stablecoin)
  const formatToken6 = (amount: string) => formatTokenAmount(amount, 6);

  const vault = vaultQuery.data as VaultData | undefined;

  if (address && (!withdrawWatch("userAddress") || withdrawWatch("userAddress") === "")) {
    try { withdrawSetValue("userAddress", address, { shouldValidate: true }); } catch {}
  }

  if (address && (!depositWatch("userAddress") || depositWatch("userAddress") === "")) {
    try { depositSetValue("userAddress", address, { shouldValidate: true }); } catch {}
  }

  if (address && (!profitWatch("userAddress") || profitWatch("userAddress") === "")) {
    try { profitSetValue("userAddress", address, { shouldValidate: true }); } catch {}
  }

  const computeAvailablePrincipal = (userAddr: string) => {
    if (!vault || !userAddr || !/^0x[a-fA-F0-9]{40}$/.test(userAddr)) return 0n;
    const totalDeposits = (vault.deposits || [])
      .filter((d: any) => d.user?.address === userAddr)
      .reduce((acc: bigint, d: any) => acc + BigInt(d.amount), 0n);
    const totalWithdrawals = (vault.withdrawals || [])
      .filter((w: any) => w.user?.address === userAddr)
      .reduce((acc: bigint, w: any) => acc + BigInt(w.amount), 0n);
    return totalDeposits - totalWithdrawals;
  };

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
                <div className="flex flex-col items-end space-y-2">
                  {vault.isPaused && (
                    <div className="flex items-center space-x-2 rounded-full bg-red-500 px-4 py-2">
                      <AlertCircle className="h-5 w-5 text-white" />
                      <span className="font-semibold text-white">Paused</span>
                    </div>
                  )}
                  {expectedChainId && walletChainId && expectedChainId !== walletChainId && (
                    <div className="flex items-center space-x-2 rounded-full bg-yellow-400 px-4 py-2 text-yellow-900">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">Wrong network. Expected {expectedChainId}, wallet {walletChainId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-indigo-200">Total Value Locked</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatToken6(vault.totalValueLocked)} {vault.tokenSymbol}
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

              {/* New Fee Model Information */}
              <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
                <h3 className="text-sm font-semibold text-indigo-200 mb-3">💎 Revolutionary Fee Structure</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">0%</div>
                    <div className="text-xs text-indigo-200">Deposit Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">10-30%</div>
                    <div className="text-xs text-indigo-200">Performance Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">0%</div>
                    <div className="text-xs text-indigo-200">Withdrawal Fee</div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-indigo-100 text-center">
                  🚀 Only pay on profits! No fees on deposits or withdrawals. Maximum capital efficiency.
                </p>
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
                  onClick={() => setActiveTab("withdraw")}
                  className={`flex items-center space-x-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === "withdraw"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ArrowUpCircle className="h-5 w-5" />
                  <span>Withdraw Capital</span>
                </button>
                </div>

                {activeTab === "deposit" ? (
                  <form onSubmit={handleDepositSubmit(onDepositSubmit)} className="space-y-4">
                    <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-900">
                      This action sends two transactions with your wallet: <span className="font-semibold">Approve</span> the vault as spender of your tokens, then <span className="font-semibold">Deposit</span> the chosen amount.
                    </div>
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
                      <label htmlFor="amountDecimal" className="mb-1 block text-sm font-medium text-gray-700">
                        Amount ({vault.tokenSymbol})
                      </label>
                      <input
                        id="amountDecimal"
                        type="text"
                        placeholder="e.g., 10 or 10.5"
                        {...depositRegister("amountDecimal")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {depositErrors.amountDecimal && (
                        <p className="mt-1 text-sm text-red-600">{depositErrors.amountDecimal.message}</p>
                      )}
                      {(() => {
                        const amountDec = depositWatch("amountDecimal") || "";
                        const decimals = inferTokenDecimals(vault.tokenSymbol);
                        const smallest = amountDec && /^\d+(\.\d+)?$/.test(amountDec)
                          ? toSmallestUnits(amountDec, decimals)
                          : "";
                        const usd = amountDec && !isNaN(Number(amountDec)) && tokenUsdPrice
                          ? formatUSDValue(Number(amountDec) * tokenUsdPrice)
                          : "";
                        const minSmallest = factorySettingsQuery.data?.minDeposit;
                        const minToken = minSmallest ? formatDecimalFromSmallest(minSmallest, decimals) : "";
                        const minUsd = minToken && tokenUsdPrice ? formatUSDValue(Number(minToken) * tokenUsdPrice) : "";
                        const tooLow = minSmallest && smallest ? (BigInt(smallest) < BigInt(minSmallest)) : false;
                        return (
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                              <span className="font-medium">≈ USD:</span> {usd ? `$${usd}` : "-"}
                            </div>
                            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                              <span className="font-medium">Smallest unit:</span> {smallest || "-"}
                            </div>
                            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                              <span className="font-medium">Min deposit:</span> {minToken ? `${minToken} ${vault.tokenSymbol}` : "-"}
                              {minUsd && <span className="ml-1 text-gray-500">(≈ ${minUsd})</span>}
                              {tooLow && (
                                <span className="ml-2 text-red-600">Amount below minimum</span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        (prepareDepositMutation.isPending || finalizeDepositMutation.isPending) ||
                        vault.isPaused ||
                        (() => {
                          const amountDec = depositWatch("amountDecimal") || "";
                          const decimals = inferTokenDecimals(vault.tokenSymbol);
                          const smallest = amountDec && /^\d+(\.\d+)?$/.test(amountDec)
                            ? toSmallestUnits(amountDec, decimals)
                            : "";
                          const minSmallest = factorySettingsQuery.data?.minDeposit;
                          return !!minSmallest && !!smallest && BigInt(smallest) < BigInt(minSmallest);
                        })()
                      }
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                    >
                      {(prepareDepositMutation.isPending || finalizeDepositMutation.isPending) ? "Processing..." : "Deposit"}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleWithdrawSubmit(async (data) => {
                      if (!isConnected) {
                        toast.error("Please connect your wallet");
                        return;
                      }
                      if (!vaultAddressValid) {
                        toast.error("Vault address invalid (expected 0x + 40 hex). Please recreate the vault.");
                        return;
                      }
                      try {
                        const decimals = inferTokenDecimals(vault?.tokenSymbol);
                        const smallest = toSmallestUnits(data.amountDecimal, decimals);
                        const { preparedTx, request } = await withdrawCapitalMutation.mutateAsync({
                          mode: "customer",
                          executeNow: true,
                          userAddress: data.userAddress,
                          vaultId: parseInt(vaultId),
                          amount: smallest,
                        } as any);
                        const txHash = await sendPreparedTx(preparedTx);
                        await finalizeWithdrawCapitalMutation.mutateAsync({
                          userAddress: data.userAddress,
                          requestId: request.id,
                          txHash,
                        });
                      } catch (error: any) {
                        console.error(error);
                        const msg = error?.message || "Failed to send transaction";
                        if (msg.includes("Vault address invalid")) {
                          toast.error("Vault address invalid (expected 0x + 40 hex). Please recreate the vault.");
                        } else {
                          toast.error(msg);
                        }
                      }
                    })}
                    className="space-y-4"
                  >
                    {(() => {
                      const userAddrInput = withdrawWatch("userAddress") || address || "";
                      const available = computeAvailablePrincipal(userAddrInput);
                      const decimals = inferTokenDecimals(vault.tokenSymbol);
                      const availableToken = formatTokenAmount(available.toString(), decimals);
                      const availableTokens = Number(BigInt(available)) / Number(BigInt("1" + "0".repeat(decimals)));
                      const availableUsd = tokenUsdPrice ? formatUSDValue(availableTokens * tokenUsdPrice) : "-";
                      const canWithdrawAll = isConnected && userAddrInput && available > 0n;
                      return (
                        <div className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Available:</span> {availableToken} {vault.tokenSymbol}
                              <span className="ml-2 text-gray-500">{isStableToken(vault.tokenSymbol) ? `(≈ $${availableUsd})` : ""}</span>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!canWithdrawAll) return;
                                if (!isConnected) { toast.error("Please connect your wallet"); return; }
                                if (!vaultAddressValid) { toast.error("Vault address invalid (expected 0x + 40 hex). Please recreate the vault."); return; }
                                try {
                                  const { preparedTx, request } = await withdrawCapitalMutation.mutateAsync({
                                    mode: "customer",
                                    executeNow: true,
                                    userAddress: userAddrInput,
                                    vaultId: parseInt(vaultId),
                                    amount: available.toString(),
                                  } as any);
                                  const txHash = await sendPreparedTx(preparedTx);
                                  await finalizeWithdrawCapitalMutation.mutateAsync({
                                    userAddress: userAddrInput,
                                    requestId: request.id,
                                    txHash,
                                  });
                                } catch (error: any) {
                                  console.error(error);
                                  const msg = error?.message || "Failed to send transaction";
                                  if (msg.includes("Vault address invalid")) {
                                    toast.error("Vault address invalid (expected 0x + 40 hex). Please recreate the vault.");
                                  } else {
                                    toast.error(msg);
                                  }
                                }
                              }}
                              disabled={!canWithdrawAll || !vaultAddressValid}
                              className="rounded-md bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                            >
                              Withdraw All {tokenUsdPrice && availableUsd !== "-" ? `(≈ $${availableUsd})` : ""}
                            </button>
                          </div>
                          {!vaultAddressValid && (
                            <div className="mt-3 flex items-center text-xs text-red-600">
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Vault address invalid (expected 0x + 40 hex). Please recreate the vault.
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[25, 50, 75, 100].map((pct) => {
                              const part = (available * BigInt(pct)) / 100n;
                              const partToken = formatTokenAmount(part.toString(), decimals);
                              const partTokens = Number(BigInt(part)) / Number(BigInt("1" + "0".repeat(decimals)));
                              const partUsd = tokenUsdPrice ? formatUSDValue(partTokens * tokenUsdPrice) : "-";
                              return (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => {
                                    const int = part / BigInt("1" + "0".repeat(decimals));
                                    const frac = part % BigInt("1" + "0".repeat(decimals));
                                    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
                                    const decStr = fracStr.length > 0 ? `${int.toString()}.${fracStr}` : int.toString();
                                    withdrawSetValue("amountDecimal", decStr, { shouldValidate: true });
                                  }}
                                  disabled={!canWithdrawAll || !vaultAddressValid}
                                  className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  {pct}% {tokenUsdPrice && partUsd !== "-" ? `(≈ $${partUsd})` : `(${partToken} ${vault.tokenSymbol})`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                    <div>
                      <label htmlFor="withdrawUserAddress" className="mb-1 block text-sm font-medium text-gray-700">
                        User Address
                      </label>
                      <input
                        id="withdrawUserAddress"
                        type="text"
                        placeholder="0x..."
                        {...withdrawRegister("userAddress")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {withdrawErrors.userAddress && (
                        <p className="mt-1 text-sm text-red-600">{withdrawErrors.userAddress.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="withdrawAmountDecimal" className="mb-1 block text-sm font-medium text-gray-700">
                        Amount ({vault.tokenSymbol})
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          id="withdrawAmountDecimal"
                          type="text"
                          placeholder="e.g., 10 or 10.5"
                          {...withdrawRegister("amountDecimal")}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {withdrawErrors.amountDecimal && (
                        <p className="mt-1 text-sm text-red-600">{withdrawErrors.amountDecimal.message}</p>
                      )}
                      {(() => {
                        const amountDec = withdrawWatch("amountDecimal") || "";
                        const userAddrInput = withdrawWatch("userAddress") || address || "";
                        const decimals = inferTokenDecimals(vault.tokenSymbol);
                        const smallest = amountDec && /^\d+(\.\d+)?$/.test(amountDec)
                          ? toSmallestUnits(amountDec, decimals)
                          : "";
                        const usd = amountDec && !isNaN(Number(amountDec)) && tokenUsdPrice
                          ? formatUSDValue(Number(amountDec) * tokenUsdPrice)
                          : "";
                        const available = computeAvailablePrincipal(userAddrInput);
                        const exceeds = smallest && /^[0-9]+$/.test(smallest)
                          ? (BigInt(smallest) > available)
                          : false;
                        const availableFmt = formatTokenAmount(available.toString(), decimals);
                        return (
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                              <span className="font-medium">≈ USD:</span> {usd ? `$${usd}` : "-"}
                            </div>
                            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                              <span className="font-medium">Smallest unit:</span> {smallest || "-"}
                            </div>
                            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-700 sm:col-span-2">
                              <span className="font-medium">Available principal:</span> {userAddrInput ? `${availableFmt} ${vault.tokenSymbol}` : "-"}
                            </div>
                            {exceeds && (
                              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700 sm:col-span-2">
                                Requested amount exceeds available principal for this address.
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      type="submit"
                      disabled={(function(){
                        const amountDec = withdrawWatch("amountDecimal") || "";
                        const userAddrInput = withdrawWatch("userAddress") || address || "";
                        const decimals = inferTokenDecimals(vault.tokenSymbol);
                        const smallest = amountDec && /^\d+(\.\d+)?$/.test(amountDec) ? toSmallestUnits(amountDec, decimals) : "";
                        const available = computeAvailablePrincipal(userAddrInput);
                        const invalid = !isConnected || !userAddrInput || !smallest || !/^\d+$/.test(smallest) || BigInt(smallest) === 0n;
                        const tooMuch = smallest && /^\d+$/.test(smallest) ? BigInt(smallest) > available : false;
                        return invalid || tooMuch;
                      })()}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
                    >
                      <ArrowUpCircle className="h-5 w-5" />
                      <span>{(withdrawCapitalMutation.isPending || finalizeWithdrawCapitalMutation.isPending) ? "Processing..." : "Withdraw Capital"}</span>
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
                      {vault.deposits.map((deposit: any) => (
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
                          <p className="font-semibold text-gray-900">{formatTokenAmount(deposit.amount, inferTokenDecimals(vault.tokenSymbol))} {vault.tokenSymbol}</p>
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
                      {vault.profits.map((profit: any) => (
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
                            <p className="font-semibold text-green-600">{formatTokenAmount(profit.amount, inferTokenDecimals(vault.tokenSymbol))} {vault.tokenSymbol}</p>
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

                {/* Recent Capital Withdrawals */}
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center space-x-2 text-lg font-bold text-gray-900">
                    <ArrowUpCircle className="h-5 w-5 text-cyan-600" />
                    <span>Recent Capital Withdrawals</span>
                  </h3>
                  {vault.withdrawals && vault.withdrawals.length > 0 ? (
                    <div className="space-y-3">
                      {vault.withdrawals.map((w: any) => (
                        <div key={w.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {w.user.address.slice(0, 10)}...{w.user.address.slice(-8)}
                            </p>
                            <p className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(w.createdAt).toLocaleString()}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-cyan-600">{formatTokenAmount(w.amount, inferTokenDecimals(vault.tokenSymbol))} {vault.tokenSymbol}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500">No capital withdrawals yet</p>
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
