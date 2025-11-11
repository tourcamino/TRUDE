import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { Sparkline } from "~/components/Sparkline";
import { useTRPC } from "~/trpc/react";
import { useEthUsdPrice, formatWeiToUSD } from "~/utils/currency";
import { useWalletStore } from "~/stores/walletStore";
import { 
  Vault, 
  Plus, 
  Search,
  TrendingUp,
  Clock,
  X,
  List,
  LayoutGrid
} from "lucide-react";

export const Route = createFileRoute("/vaults/")({
  component: VaultsPage,
});

const createVaultSchema = z.object({
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  tokenSymbol: z.string().min(1, "Token symbol is required").max(10, "Max 10 characters"),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  ledgerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

type CreateVaultForm = z.infer<typeof createVaultSchema>;

function VaultsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [sortKey, setSortKey] = useState<"tvl" | "yield" | "change">("tvl");
  const [yieldThreshold, setYieldThreshold] = useState<number>(0.02);
  const priceQuery = useEthUsdPrice();
  const toUSD = (wei: string) => (priceQuery.data ? formatWeiToUSD(wei, priceQuery.data) : "...");
  const { address, isConnected } = useWalletStore();
  const zeroAddr = "0x0000000000000000000000000000000000000000";
  const isDepositedFilter = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("filter") === "deposited";
    } catch {
      return false;
    }
  })();
  const isHighYieldFilter = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("filter") === "highyield";
    } catch {
      return false;
    }
  })();
  const isRisingFilter = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("filter") === "rising";
    } catch {
      return false;
    }
  })();

  // Debounce search input to reduce re-renders during fast typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const vaultsQuery = useQuery(
    trpc.getVaults.queryOptions({ limit: 20 })
  );

  const metricsQuery = useQuery(
    trpc.getVaultMetrics.queryOptions(
      { vaultIds: (vaultsQuery.data?.vaults ?? []).map((v) => v.id), rangeDays: 30 },
      { enabled: !!vaultsQuery.data?.vaults?.length }
    )
  );

  const metricsById = new Map<number, any>(
    (metricsQuery.data?.metrics ?? []).map((m: any) => [m.id, m])
  );

  const formatChangeUSD = (changeStr: string | undefined): { text: string; positive: boolean | null } => {
    if (!changeStr) return { text: "…", positive: null };
    try {
      const num = Number(changeStr);
      const positive = num > 0 ? true : num < 0 ? false : null;
      const absStr = String(Math.abs(num));
      const usd = toUSD(absStr);
      const text = positive === null ? `$${usd}` : `${positive ? "+" : "-"}$${usd}`;
      return { text, positive };
    } catch {
      return { text: "…", positive: null };
    }
  };

  // Fetch user dashboard only when filtering by deposited vaults
  const userDashboardQuery = useQuery(
    trpc.getUserDashboard.queryOptions(
      { userAddress: address || zeroAddr },
      { enabled: isDepositedFilter && isConnected && !!address }
    )
  );

  const createVaultMutation = useMutation(
    trpc.createVault.mutationOptions({
      onSuccess: () => {
        toast.success("Vault created successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        setShowCreateModal(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create vault");
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateVaultForm>({
    resolver: zodResolver(createVaultSchema),
    defaultValues: { 
      tokenSymbol: "",
      ownerAddress: zeroAddr,
      ledgerAddress: zeroAddr,
      tokenAddress: ""
    },
  });

  // Prefill sensible defaults when opening the modal
  useEffect(() => {
    if (showCreateModal) {
      reset({
        tokenSymbol: "",
        ownerAddress: address || zeroAddr,
        ledgerAddress: zeroAddr,
        tokenAddress: ""
      });
    }
  }, [showCreateModal, address, reset]);

  const onSubmit = (data: CreateVaultForm) => {
    createVaultMutation.mutate(data);
  };

  // Keep local ether formatter only if needed elsewhere; TVL displays use USD

  // Base filter by search term
  let filteredVaults = vaultsQuery.data?.vaults.filter((vault) =>
    vault.tokenSymbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    vault.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Apply deposited-only filter when requested
  if (isDepositedFilter) {
    const depositedVaultIds = new Set<number>(
      (userDashboardQuery.data?.deposits || []).map((d: any) => d.vaultId)
    );
    filteredVaults = filteredVaults?.filter((v) => depositedVaultIds.has(v.id));
  }

  // Apply High yield filter (configurable threshold)
  if (isHighYieldFilter) {
    filteredVaults = filteredVaults?.filter((v) => {
      const m = metricsById.get(v.id);
      return m && typeof m.yield30d === "number" && m.yield30d >= yieldThreshold;
    });
  }

  // Apply Rising TVL filter (positive 24h change)
  if (isRisingFilter) {
    filteredVaults = filteredVaults?.filter((v) => {
      const m = metricsById.get(v.id);
      if (!m || typeof m.change24h !== "string") return false;
      try { return Number(m.change24h) > 0; } catch { return false; }
    });
  }

  // Sort by selected metric (default: TVL desc)
  filteredVaults = filteredVaults?.slice().sort((a, b) => {
    try {
      if (sortKey === "tvl") {
        const aTVL = BigInt(a.totalValueLocked ?? "0");
        const bTVL = BigInt(b.totalValueLocked ?? "0");
        return sortDir === "desc" ? (bTVL > aTVL ? 1 : bTVL < aTVL ? -1 : 0) : (aTVL > bTVL ? 1 : aTVL < bTVL ? -1 : 0);
      }
      if (sortKey === "yield") {
        const ay = metricsById.get(a.id)?.yield30d ?? 0;
        const by = metricsById.get(b.id)?.yield30d ?? 0;
        return sortDir === "desc" ? by - ay : ay - by;
      }
      // sortKey === "change"
      const ac = Number(metricsById.get(a.id)?.change24h ?? 0);
      const bc = Number(metricsById.get(b.id)?.change24h ?? 0);
      return sortDir === "desc" ? bc - ac : ac - bc;
    } catch {
      return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Vaults</h1>
            <p className="mt-2 text-gray-600">Explore and manage TRUDE vaults</p>
            {isDepositedFilter && (
              <div className="mt-3 inline-flex items-center rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-700">
                Showing only vaults you have deposited into
                <Link
                  to="/vaults"
                  className="ml-3 text-teal-600 underline hover:text-teal-800"
                >
                  Clear filter
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Create Vault</span>
          </button>
        </div>

        {/* Search & Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by symbol or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter chips */}
            <div className="flex items-center gap-2">
              <Link to="/vaults" className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${!isDepositedFilter ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                All
              </Link>
              <Link to="/vaults" search={{ filter: "deposited" }} className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${isDepositedFilter ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                Deposited
              </Link>
              <Link to="/vaults" search={{ filter: "highyield" }} className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${isHighYieldFilter ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                High yield
              </Link>
              <Link to="/vaults" search={{ filter: "rising" }} className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${isRisingFilter ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                Rising TVL
              </Link>
            </div>

            {/* Sort & View toggles */}
            <div className="flex items-center gap-2">
              <label className="mr-2 text-sm text-gray-600">Sort by:</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as "tvl" | "yield" | "change")}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="tvl">TVL</option>
                <option value="yield">30d yield</option>
                <option value="change">24h change</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as "desc" | "asc")}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

              {isHighYieldFilter && (
                <div className="ml-2 flex items-center gap-2">
                  <label className="text-sm text-gray-600">Min yield:</label>
                  <select
                    value={yieldThreshold}
                    onChange={(e) => setYieldThreshold(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0.01}>1%</option>
                    <option value={0.02}>2%</option>
                    <option value={0.05}>5%</option>
                  </select>
                </div>
              )}

              <div className="ml-2 inline-flex overflow-hidden rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
                >
                  <List className="h-4 w-4" /> List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
                >
                  <LayoutGrid className="h-4 w-4" /> Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vaults List/Grid */}
        {vaultsQuery.isLoading || (isDepositedFilter && userDashboardQuery.isLoading) ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200"></div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b p-4 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredVaults && filteredVaults.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVaults.map((vault) => (
                <Link
                  key={vault.id}
                  to="/vaults/$vaultId"
                  params={{ vaultId: vault.id.toString() }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Vault className="h-6 w-6 text-white" />
                      </div>
                      {vault.isPaused && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                          Paused
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{vault.tokenSymbol} Vault</h3>
                    <p className="mb-4 text-sm text-gray-500">
                      {vault.address.slice(0, 10)}...{vault.address.slice(-8)}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">TVL</span>
                        <span className="font-semibold text-gray-900">${toUSD(vault.totalValueLocked)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">24h change</span>
                        {(() => {
                          const m = metricsById.get(vault.id);
                          const f = formatChangeUSD(m?.change24h);
                          const color = f.positive === null ? "text-gray-900" : f.positive ? "text-emerald-600" : "text-red-600";
                          return <span className={`text-sm font-medium ${color}`}>{f.text}</span>;
                        })()}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">30d yield</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(() => {
                            const m = metricsById.get(vault.id);
                            return m ? `${(m.yield30d * 100).toFixed(2)}%` : "…";
                          })()}
                        </span>
                      </div>
                      <div className="pt-1">
                        <Sparkline className="w-full" values={metricsById.get(vault.id)?.sparkline ?? []} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Created</span>
                        </span>
                        <span className="text-sm text-gray-900">
                          {new Date(vault.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-sm font-medium text-indigo-600">View Details</span>
                      <TrendingUp className="h-5 w-5 text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow">
              {filteredVaults.map((vault) => (
                <Link
                  key={vault.id}
                  to="/vaults/$vaultId"
                  params={{ vaultId: vault.id.toString() }}
                  className="flex items-center justify-between border-b p-4 transition-colors hover:bg-gray-50 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Vault className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{vault.tokenSymbol} Vault</div>
                      <div className="text-xs text-gray-500">{vault.address.slice(0, 10)}...{vault.address.slice(-8)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {vault.isPaused && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                        Paused
                      </span>
                    )}
                    <div className="hidden md:block">
                      <Sparkline className="w-28" values={metricsById.get(vault.id)?.sparkline ?? []} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">TVL</div>
                      <div className="text-sm font-semibold text-gray-900">${toUSD(vault.totalValueLocked)}</div>
                      <div className="mt-1 text-xs text-gray-600">24h change</div>
                      {(() => {
                        const m = metricsById.get(vault.id);
                        const f = formatChangeUSD(m?.change24h);
                        const color = f.positive === null ? "text-gray-900" : f.positive ? "text-emerald-600" : "text-red-600";
                        return <div className={`text-xs font-medium ${color}`}>{f.text}</div>;
                      })()}
                      <div className="text-xs text-gray-600 mt-1">30d yield</div>
                      <div className="text-xs font-medium text-gray-900">
                        {(() => {
                          const m = metricsById.get(vault.id);
                          return m ? `${(m.yield30d * 100).toFixed(2)}%` : "…";
                        })()}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">Details</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Vault className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No vaults found</h3>
            <p className="text-gray-600">
              {isDepositedFilter
                ? "You don't have deposits in any vault yet"
                : "Try adjusting your search or create a new vault"}
            </p>
          </div>
        )}
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New Vault</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="tokenAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Token Address
                </label>
                <input
                  id="tokenAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("tokenAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.tokenAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.tokenAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tokenSymbol" className="mb-1 block text-sm font-medium text-gray-700">
                  Token Symbol
                </label>
                <input
                  id="tokenSymbol"
                  type="text"
                  placeholder="USDC"
                  {...register("tokenSymbol")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.tokenSymbol && (
                  <p className="mt-1 text-sm text-red-600">{errors.tokenSymbol.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ownerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Owner Address
                </label>
                <input
                  id="ownerAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("ownerAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.ownerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ledgerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Ledger Address
                </label>
                <input
                  id="ledgerAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("ledgerAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.ledgerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.ledgerAddress.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createVaultMutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {createVaultMutation.isPending ? "Creating..." : "Create Vault"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
