import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { setPageTitle } from "~/utils/seo";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { Sparkline } from "~/components/Sparkline";
import { useTRPC } from "~/trpc/react";
import { useEthUsdPrice, formatWeiToUSD } from "~/utils/currency";
import { 
  Settings, 
  DollarSign, 
  Percent,
  Users,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Plus,
  TrendingUp,
  Vault,
  Activity,
  UserPlus,
  Database,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

const updateSettingsSchema = z.object({
  adminToken: z.string().min(1, "Admin token is required"),
  minDeposit: z.string().optional(),
  affiliateShareBps: z.number().min(0).max(10000).optional(),
  maxFeePercent: z.number().min(0).max(100).optional(),
  isPaused: z.boolean().optional(),
});

const createVaultSchema = z.object({
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  tokenSymbol: z.string().min(1, "Token symbol is required").max(10, "Max 10 characters"),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  ledgerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});


type UpdateSettingsForm = z.infer<typeof updateSettingsSchema>;
type CreateVaultForm = z.infer<typeof createVaultSchema>;
// Profits feature removed for compliance

function AdminPage() {
  const trpc = useTRPC();
  const priceQuery = useEthUsdPrice();
  const toUSD = (wei: string) => (priceQuery.data ? formatWeiToUSD(wei, priceQuery.data) : "...");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "vaults" | "revenue" | "affiliates">("overview");
  const [adminToken, setAdminToken] = useState("");
  const sendTx = async (tx: { to: string; data: string; value: string; chainId?: number }) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) { toast.error("Wallet not available" ); return; }
    await ethereum.request({ method: "eth_sendTransaction", params: [tx] });
  };

  const settingsQuery = useQuery(trpc.getFactorySettings.queryOptions());
  const dashboardQuery = useQuery(trpc.getDashboardStats.queryOptions());
  const vaultsQuery = useQuery(trpc.getVaults.queryOptions({}));
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [expectedChainId, setExpectedChainId] = useState<number | null>(null);
  useEffect(() => {
    setPageTitle("TRUDE • Admin");
    (async () => {
      try { const res = await fetch("/api/health"); const json = await res.json(); setExpectedChainId(json.chainId ?? null); } catch {}
      try { const ethereum: any = (window as any).ethereum; if (ethereum) { const hex = await ethereum.request({ method: "eth_chainId" }); const id = typeof hex === "string" ? parseInt(hex, 16) : Number(hex); setWalletChainId(id); } } catch {}
    })();
  }, []);
  const affiliatesQuery = useQuery(trpc.getAffiliateStats.queryOptions());
  const revenueMetricsQuery = useQuery(trpc.getRevenueMetrics.queryOptions());
  const revenueByAffiliateQuery = useQuery(trpc.getRevenueByAffiliate.queryOptions());
  const revenueByVaultQuery = useQuery(trpc.getRevenueByVault.queryOptions());
  const [tsDays, setTsDays] = useState(14);
  const [tsVault, setTsVault] = useState<number | null>(null);
  const [tsReferrer, setTsReferrer] = useState<number | null>(null);
  const revenueTimeseriesQuery = useQuery(trpc.getRevenueTimeseries.queryOptions({ days: tsDays, vaultId: tsVault || undefined, referrerId: tsReferrer || undefined }));
  const exportAffiliatesMutation = useMutation(trpc.exportAffiliatesCSV.mutationOptions({
    onSuccess: (res) => {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV Affiliati esportato");
    },
    onError: (error) => { toast.error(error.message || "Failed to export affiliates CSV"); }
  }));
  const exportUsersMutation = useMutation(trpc.exportUsersCSV.mutationOptions({
    onSuccess: (res) => {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV Utenti esportato");
    },
    onError: (error) => { toast.error(error.message || "Failed to export users CSV"); }
  }));

  const updateSettingsMutation = useMutation(
    trpc.updateFactorySettings.mutationOptions({
      onSuccess: () => {
        toast.success("Settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getFactorySettings.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update settings");
      },
    })
  );

  const prepareOnchainSettingsMutation = useMutation(
    trpc.prepareUpdateFactorySettingsOnChain.mutationOptions({
      onSuccess: async (res) => {
        if (res.success && Array.isArray(res.prepared)) {
          for (const tx of res.prepared) {
            await sendTx(tx as any);
          }
          toast.success("On-chain settings updated");
        } else {
          toast.error("No transactions prepared");
        }
      },
      onError: (error) => { toast.error(error.message || "Failed to prepare on-chain settings"); }
    })
  );

  const createVaultMutation = useMutation(
    trpc.createVault.mutationOptions({
      onSuccess: () => {
        toast.success("Vault created successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        resetVaultForm();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create vault");
      },
    })
  );

  const pauseVaultMutation = useMutation(
    trpc.pauseVault.mutationOptions({
      onSuccess: () => {
        toast.success("Vault status updated");
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update status");
      },
    })
  );

  const pauseVaultOnChainMutation = useMutation(
    trpc.pauseVaultOnChain.mutationOptions({
      onSuccess: async (res) => { if (res.success) { await sendTx(res.preparedTx as any); toast.success("Vault paused on-chain"); } },
      onError: (error) => { toast.error(error.message || "Failed to pause on-chain"); }
    })
  );

  const unpauseVaultOnChainMutation = useMutation(
    trpc.unpauseVaultOnChain.mutationOptions({
      onSuccess: async (res) => { if (res.success) { await sendTx(res.preparedTx as any); toast.success("Vault unpaused on-chain"); } },
      onError: (error) => { toast.error(error.message || "Failed to unpause on-chain"); }
    })
  );

  const deleteVaultMutation = useMutation(
    trpc.deleteVault.mutationOptions({
      onSuccess: () => {
        toast.success("Vault deleted");
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete vault");
      },
    })
  );

  const deleteAllVaultsMutation = useMutation(
    trpc.deleteAllVaults.mutationOptions({
      onSuccess: (res) => {
        toast.success(`Deleted all vaults (${res.deleted.vaults}) and related records`);
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
      },
      onError: (error) => {
        // Show a friendlier message when TRPC client cannot transform the server response
        const msg = /transform response/i.test(error.message || "")
          ? "Unable to transform response from server. Check server logs and ensure router exposes deleteAllVaults."
          : (error.message || "Failed to delete all vaults");
        toast.error(msg);
      },
    })
  );

  const prepareRegisterAffiliateMutation = useMutation(
    trpc.prepareRegisterAffiliate.mutationOptions({
      onSuccess: async (res) => { if (res.success) { await sendTx(res.preparedTx as any); toast.success("RegisterAffiliate broadcasted"); } },
      onError: (error) => { toast.error(error.message || "Failed to prepare registerAffiliate"); }
    })
  );

  const finalizeRegisterAffiliateMutation = useMutation(
    trpc.finalizeRegisterAffiliate.mutationOptions({
      onSuccess: () => { toast.success("Affiliate registered in DB"); queryClient.invalidateQueries({ queryKey: trpc.getAffiliateStats.queryKey() }); },
      onError: (error) => { toast.error(error.message || "Failed to finalize registerAffiliate"); }
    })
  );

  const pauseAllVaultsMutation = useMutation(
    trpc.pauseAllVaults.mutationOptions({
      onSuccess: (res) => {
        toast.success(`${res.isPaused ? "Paused" : "Unpaused"} all vaults (${res.updatedCount})`);
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
      },
      onError: (error) => {
        const msg = /transform response/i.test(error.message || "")
          ? "Unable to transform response from server. Check server logs and router registration."
          : (error.message || "Failed to update vault pause state");
        toast.error(msg);
      },
    })
  );

  // Profits feature removed for compliance

  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    formState: { errors: settingsErrors },
  } = useForm<UpdateSettingsForm>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      adminToken: "",
    },
  });

  const {
    register: registerVault,
    handleSubmit: handleSubmitVault,
    formState: { errors: vaultErrors },
    reset: resetVaultForm,
  } = useForm<CreateVaultForm>({
    resolver: zodResolver(createVaultSchema),
    defaultValues: { tokenSymbol: "" },
  });

  // Profits form removed for compliance

  const onSubmitSettings = (data: UpdateSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  const onSubmitSettingsOnChain = (data: UpdateSettingsForm) => {
    const payload: any = {};
    if (data.minDeposit) payload.minDeposit = data.minDeposit;
    if (typeof data.affiliateShareBps === "number") payload.affiliateShareBps = data.affiliateShareBps;
    if (typeof data.maxFeePercent === "number") payload.maxFeePercent = data.maxFeePercent;
    prepareOnchainSettingsMutation.mutate(payload);
  };

  const onSubmitVault = (data: CreateVaultForm) => {
    createVaultMutation.mutate(data);
  };

  const onSubmitCreateVaultOnChain = (data: CreateVaultForm) => {
    prepareCreateVaultMutation.mutate({ tokenAddress: data.tokenAddress });
  };

  // Profits submit handler removed for compliance

  const formatEther = (wei: string) => {
    const ether = Number(BigInt(wei) / BigInt(1e18));
    return ether.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };
  const formatUSDC = (smallest: string) => {
    const n = Number(BigInt(smallest)) / 1e6;
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const settings = settingsQuery.data;
  const dashboard = dashboardQuery.data;
  const vaults = vaultsQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-gray-600">Manage factory settings and protocol parameters</p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8 flex items-start space-x-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-900">Admin Access Required</h3>
            <p className="text-sm text-yellow-700">
              You need the admin token to perform administrative actions. For demo purposes, use: <code className="rounded bg-yellow-100 px-1">admin123</code>
            </p>
          </div>
        </div>

        {/* Network Banner */}
        {expectedChainId && walletChainId && expectedChainId !== walletChainId && (
          <div className="mb-8 flex items-start space-x-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Wrong network</h3>
              <p className="text-sm text-yellow-700">Expected chain {expectedChainId}, wallet {walletChainId}. Please switch your wallet network.</p>
            </div>
          </div>
        )}

        {/* Database Fallback Banner */}
        {dashboard?.isFallback && (
          <div className="mb-8 flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Database unavailable</h3>
              <p className="text-sm text-red-700">
                Showing default demo values while the database is offline. Start Docker services or configure <code className="rounded bg-red-100 px-1">DATABASE_URL</code> for local development.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex space-x-2 rounded-xl bg-white p-2 shadow-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("vaults")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "vaults"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Vault className="h-4 w-4" />
              <span>Vaults</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("affiliates")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "affiliates"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Affiliates</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === "revenue"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Ricavi</span>
            </div>
          </button>
          {/* Profits tab removed for compliance */}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* System Stats */}
            {dashboardQuery.isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="mb-2 flex items-center space-x-2 text-gray-600">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Total TVL</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${toUSD(dashboard?.totalTVL || "0")}</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="mb-2 flex items-center space-x-2 text-gray-600">
                    <Vault className="h-5 w-5" />
                    <span className="text-sm font-medium">Active Vaults</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{dashboard?.vaultCount || 0}</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="mb-2 flex items-center space-x-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">Total Users</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{dashboard?.userCount || 0}</p>
                  <p className="text-sm text-gray-500">{dashboard?.affiliateCount || 0} affiliates</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="mb-2 flex items-center space-x-2 text-gray-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Total Profits</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${toUSD(dashboard?.totalProfits || "0")}</p>
                </div>
              </div>
            )}

            {/* Current Settings Display */}
            {settingsQuery.isLoading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-gray-200"></div>
            ) : settings ? (
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Current Factory Settings</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm font-medium">Minimum Deposit</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${toUSD(settings.minDeposit)}</p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-center space-x-2 text-gray-600">
                      <Users className="h-5 w-5" />
                      <span className="text-sm font-medium">Affiliate Share</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{settings.affiliateShareBps / 100}%</p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-center space-x-2 text-gray-600">
                      <Percent className="h-5 w-5" />
                      <span className="text-sm font-medium">Max Fee Percent</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{settings.maxFeePercent}%</p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 flex items-center space-x-2 text-gray-600">
                      {settings.isPaused ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                      <span className="text-sm font-medium">Factory Status</span>
                    </div>
                    <p className={`text-2xl font-bold ${settings.isPaused ? "text-red-600" : "text-green-600"}`}>
                      {settings.isPaused ? "Paused" : "Active"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Vaults */}
            {dashboard && dashboard.recentVaults.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Recent Vaults</h2>
                <div className="space-y-3">
                  {dashboard.recentVaults.map((vault) => (
                    <div
                      key={vault.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{vault.tokenSymbol} Vault</p>
                        <p className="text-xs text-gray-500">{vault.address.slice(0, 10)}...{vault.address.slice(-8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${priceQuery.data ? formatWeiToUSD(vault.tvl, priceQuery.data) : "..."}</p>
                        <p className="text-xs text-gray-500">TVL</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Update Factory Settings</h2>
            </div>

            <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-4">
              <div>
                <label htmlFor="adminToken" className="mb-1 block text-sm font-medium text-gray-700">
                  Admin Token *
                </label>
                <input
                  id="adminToken"
                  type="password"
                  placeholder="Enter admin token"
                  {...registerSettings("adminToken")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {settingsErrors.adminToken && (
                  <p className="mt-1 text-sm text-red-600">{settingsErrors.adminToken.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="minDeposit" className="mb-1 block text-sm font-medium text-gray-700">
                  Minimum Deposit (wei)
                </label>
                <input
                  id="minDeposit"
                  type="text"
                  placeholder="1000000000000000000"
                  {...registerSettings("minDeposit")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty to keep current value</p>
              </div>

              <div>
                <label htmlFor="affiliateShareBps" className="mb-1 block text-sm font-medium text-gray-700">
                  Affiliate Share (basis points, 0-10000)
                </label>
                <input
                  id="affiliateShareBps"
                  type="number"
                  placeholder="5000"
                  {...registerSettings("affiliateShareBps", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {settingsErrors.affiliateShareBps && (
                  <p className="mt-1 text-sm text-red-600">{settingsErrors.affiliateShareBps.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">5000 = 50%, leave empty to keep current</p>
              </div>

              <div>
                <label htmlFor="maxFeePercent" className="mb-1 block text-sm font-medium text-gray-700">
                  Max Fee Percent (0-100)
                </label>
                <input
                  id="maxFeePercent"
                  type="number"
                  placeholder="20"
                  {...registerSettings("maxFeePercent", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {settingsErrors.maxFeePercent && (
                  <p className="mt-1 text-sm text-red-600">{settingsErrors.maxFeePercent.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Leave empty to keep current value</p>
              </div>

              <div className="flex items-center">
                <input
                  id="isPaused"
                  type="checkbox"
                  {...registerSettings("isPaused")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPaused" className="ml-2 block text-sm text-gray-700">
                  Pause factory (prevents new vault creation)
                </label>
              </div>

              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? "Updating..." : "Update Settings"}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Update Factory Settings (On‑Chain)</h2>
              </div>
              <form onSubmit={handleSubmitSettings(onSubmitSettingsOnChain)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <input id="minDepositOnChain" type="text" placeholder="minDeposit (wei)" {...registerSettings("minDeposit")} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  <input id="affiliateShareBpsOnChain" type="number" placeholder="affiliateShareBps" {...registerSettings("affiliateShareBps", { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  <input id="maxFeePercentOnChain" type="number" placeholder="maxFeePercent" {...registerSettings("maxFeePercent", { valueAsNumber: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                </div>
                <button type="submit" disabled={prepareOnchainSettingsMutation.isPending} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50">
                  {prepareOnchainSettingsMutation.isPending ? "Preparing..." : "Prepare & Broadcast"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Vaults Tab */}
        {activeTab === "vaults" && (
          <div className="space-y-8">
            {/* Admin token for vault actions */}
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <label htmlFor="vaultAdminToken" className="mb-1 block text-sm font-medium text-gray-700">
                Admin Token (required for pause/delete)
              </label>
              <input
                id="vaultAdminToken"
                type="password"
                placeholder="Enter admin token"
                value={adminToken}
                onChange={(e) => { setAdminToken(e.target.value); try { window.localStorage.setItem("trpc_admin_token", e.target.value); } catch {} }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!adminToken) { toast.error("Admin token required"); return; }
                    if (!window.confirm("Delete ALL vaults and related data? This cannot be undone.")) return;
                    deleteAllVaultsMutation.mutate({ adminToken });
                  }}
                  disabled={deleteAllVaultsMutation.isPending}
                  className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {deleteAllVaultsMutation.isPending ? "Deleting..." : "Delete All Vaults"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!adminToken) { toast.error("Admin token required"); return; }
                    pauseAllVaultsMutation.mutate({ adminToken, isPaused: true });
                  }}
                  disabled={pauseAllVaultsMutation.isPending}
                  className="ml-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {pauseAllVaultsMutation.isPending ? "Pausing..." : "Pause All Vaults"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!adminToken) { toast.error("Admin token required"); return; }
                    pauseAllVaultsMutation.mutate({ adminToken, isPaused: false });
                  }}
                  disabled={pauseAllVaultsMutation.isPending}
                  className="ml-2 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {pauseAllVaultsMutation.isPending ? "Unpausing..." : "Unpause All Vaults"}
                </button>
              </div>
            </div>
            {/* Create Vault Form */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create New Vault</h2>
              </div>

              {dashboard?.isFallback && (
                <div className="mb-4 flex items-start space-x-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Database unavailable</h3>
                    <p className="text-sm text-yellow-700">
                      Vault creation is disabled while the database is offline. Start Docker or set
                      <code className="mx-1 rounded bg-yellow-100 px-1">DATABASE_URL</code> in <code className="rounded bg-yellow-100 px-1">.env</code>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitVault(onSubmitVault)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="tokenAddress" className="mb-1 block text-sm font-medium text-gray-700">
                      Token Address *
                    </label>
                    <input
                      id="tokenAddress"
                      type="text"
                      placeholder="0x..."
                      {...registerVault("tokenAddress")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {vaultErrors.tokenAddress && (
                      <p className="mt-1 text-sm text-red-600">{vaultErrors.tokenAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="tokenSymbol" className="mb-1 block text-sm font-medium text-gray-700">
                      Token Symbol *
                    </label>
                    <input
                      id="tokenSymbol"
                      type="text"
                      placeholder="USDC"
                      {...registerVault("tokenSymbol")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {vaultErrors.tokenSymbol && (
                      <p className="mt-1 text-sm text-red-600">{vaultErrors.tokenSymbol.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ownerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                      Owner Address *
                    </label>
                    <input
                      id="ownerAddress"
                      type="text"
                      placeholder="0x..."
                      {...registerVault("ownerAddress")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {vaultErrors.ownerAddress && (
                      <p className="mt-1 text-sm text-red-600">{vaultErrors.ownerAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ledgerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                      Ledger Address *
                    </label>
                    <input
                      id="ledgerAddress"
                      type="text"
                      placeholder="0x..."
                      {...registerVault("ledgerAddress")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {vaultErrors.ledgerAddress && (
                      <p className="mt-1 text-sm text-red-600">{vaultErrors.ledgerAddress.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createVaultMutation.isPending || dashboard?.isFallback}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {createVaultMutation.isPending ? "Creating..." : "Create Vault"}
                </button>
              </form>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Create Vault (On‑Chain via Factory)</h3>
                <form onSubmit={handleSubmitVault(onSubmitCreateVaultOnChain)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="tokenAddressOnChain" className="mb-1 block text-sm font-medium text-gray-700">Token Address *</label>
                      <input id="tokenAddressOnChain" type="text" placeholder="0x..." {...registerVault("tokenAddress")} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </div>
                  </div>
                  <button type="submit" disabled={prepareCreateVaultMutation.isPending} className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50">
                    {prepareCreateVaultMutation.isPending ? "Preparing..." : "Prepare & Broadcast"}
                  </button>
                </form>
              </div>
            </div>

            {/* Vaults List */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">All Vaults</h2>
              {vaultsQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
                  ))}
                </div>
              ) : vaults && vaults.vaults.length > 0 ? (
                <div className="space-y-3">
                  {vaults.vaults.map((vault) => (
                    <div
                      key={vault.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                            {vault.tokenSymbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{vault.tokenSymbol} Vault</p>
                            <p className="text-xs text-gray-500">{vault.address.slice(0, 10)}...{vault.address.slice(-8)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">TVL</p>
                          <p className="font-semibold text-gray-900">${priceQuery.data ? formatWeiToUSD(vault.totalValueLocked, priceQuery.data) : "..."}</p>
                        </div>
                      <div className="flex items-center space-x-2">
                        {vault.isPaused ? (
                          <span className="flex items-center space-x-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          <Lock className="h-3 w-3" />
                          <span>Paused</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <Unlock className="h-3 w-3" />
                          <span>Active</span>
                          </span>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!adminToken) { toast.error("Admin token required"); return; }
                            pauseVaultMutation.mutate({ adminToken, vaultId: vault.id, isPaused: !vault.isPaused });
                          }}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold shadow-sm ${vault.isPaused ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}
                        >
                          {vault.isPaused ? 'Unpause' : 'Pause'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (vault.isPaused) {
                              unpauseVaultOnChainMutation.mutate({ vaultId: vault.id });
                            } else {
                              pauseVaultOnChainMutation.mutate({ vaultId: vault.id });
                            }
                          }}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                        >
                          On‑Chain
                        </button>
                        <button
                          type="button"
                          onClick={() => { syncVaultEventsMutation.mutate({ vaultId: vault.id }); }}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                        >
                          Sync TVL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!adminToken) { toast.error("Admin token required"); return; }
                            if (!window.confirm("Delete this vault? This action cannot be undone.")) return;
                            deleteVaultMutation.mutate({ adminToken, vaultId: vault.id });
                          }}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Vault className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-sm text-gray-500">No vaults created yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "affiliates" && (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Register Affiliate (On‑Chain)</h2>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const userAddress = (form.querySelector("#affUser") as HTMLInputElement).value;
                  const affiliateAddress = (form.querySelector("#affAddr") as HTMLInputElement).value;
                  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress) || !/^0x[a-fA-F0-9]{40}$/.test(affiliateAddress)) { toast.error("Invalid addresses"); return; }
                  try {
                    const res = await prepareRegisterAffiliateMutation.mutateAsync({ userAddress, affiliateAddress });
                    const ethereum: any = (window as any).ethereum;
                    const txHash: string = await ethereum.request({ method: "eth_sendTransaction", params: [res.preparedTx] });
                    await finalizeRegisterAffiliateMutation.mutateAsync({ userAddress, affiliateAddress, txHash });
                  } catch (error: any) {
                    toast.error(error?.message || "Failed to register affiliate");
                  }
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="affUser" className="mb-1 block text-sm font-medium text-gray-700">User Address *</label>
                    <input id="affUser" type="text" placeholder="0x..." className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label htmlFor="affAddr" className="mb-1 block text-sm font-medium text-gray-700">Affiliate Address *</label>
                    <input id="affAddr" type="text" placeholder="0x..." className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </div>
                </div>
                <button type="submit" disabled={prepareRegisterAffiliateMutation.isPending || finalizeRegisterAffiliateMutation.isPending} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50">
                  {(prepareRegisterAffiliateMutation.isPending || finalizeRegisterAffiliateMutation.isPending) ? "Processing..." : "Register Affiliate"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Affiliate Stats</h2>
              </div>
              {affiliatesQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (<div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200"></div>))}
                </div>
              ) : affiliatesQuery.data && affiliatesQuery.data.items?.length > 0 ? (
                <div className="space-y-3">
                  {affiliatesQuery.data.items.map((item: any) => (
                    <div key={item.user.address} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.user.address.slice(0,10)}...{item.user.address.slice(-8)}</p>
                        <p className="text-xs text-gray-500">Referrer: {item.referrer?.address ? `${item.referrer.address.slice(0,10)}...${item.referrer.address.slice(-8)}` : '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.totalEarningsFmt} {item.tokenSymbol}</p>
                        <p className="text-xs text-gray-500">Total Earnings</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No affiliates yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-2 flex items-center space-x-2 text-gray-600">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-sm font-medium">TVL Totale</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">${formatUSDC(revenueMetricsQuery.data?.tvlTotal || "0")}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-2 flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Fee Owner (Totale)</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">${formatUSDC(revenueMetricsQuery.data?.fees.owner.total || "0")}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-2 flex items-center space-x-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">Fee Affiliati</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">${formatUSDC(revenueMetricsQuery.data?.fees.affiliate.total || "0")}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => exportAffiliatesMutation.mutate({} as any)}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Esporta Affiliati CSV
              </button>
              <button
                type="button"
                onClick={() => exportUsersMutation.mutate({} as any)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Esporta Utenti CSV
              </button>
            </div>

            {/* KPI periodo filtrato */}
            <div className="grid gap-6 md:grid-cols-3">
              {(() => {
                const series = revenueTimeseriesQuery.data?.series || [];
                const ownerSum = series.reduce((acc: bigint, s: any) => acc + BigInt(s.owner || "0"), 0n);
                const affSum = series.reduce((acc: bigint, s: any) => acc + BigInt(s.affiliate || "0"), 0n);
                const ownerCapitalSum = series.reduce((acc: bigint, s: any) => acc + BigInt(s.ownerCapital || "0"), 0n);
                const ownerProfitSum = series.reduce((acc: bigint, s: any) => acc + BigInt(s.ownerProfit || "0"), 0n);
                return (
                  <>
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                      <div className="mb-2 flex items-center space-x-2 text-gray-600">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Owner (Periodo)</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">${formatUSDC(ownerSum.toString())}</p>
                      <p className="mt-1 text-xs text-gray-500">Capitale: ${formatUSDC(ownerCapitalSum.toString())} • Profitti: ${formatUSDC(ownerProfitSum.toString())}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                      <div className="mb-2 flex items-center space-x-2 text-gray-600">
                        <Users className="h-5 w-5" />
                        <span className="text-sm font-medium">Affiliati (Periodo)</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">${formatUSDC(affSum.toString())}</p>
                      <p className="mt-1 text-xs text-gray-500">Profitti affiliati sul periodo selezionato</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                      <div className="mb-2 flex items-center space-x-2 text-gray-600">
                        <BarChart3 className="h-5 w-5" />
                        <span className="text-sm font-medium">Media Giornaliera (Owner)</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">${formatUSDC(((series.length ? (ownerSum / BigInt(series.length)) : 0n)).toString())}</p>
                      <p className="mt-1 text-xs text-gray-500">Calcolata sul periodo filtrato</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Periodo</div>
              <select
                value={tsDays}
                onChange={(e) => setTsDays(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>7 giorni</option>
                <option value={14}>14 giorni</option>
                <option value={30}>30 giorni</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                <label className="mb-1 block text-sm font-medium text-gray-700">Filtra per Vault</label>
                <select
                  value={tsVault ?? ''}
                  onChange={(e) => setTsVault(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tutti</option>
                  {(vaults?.vaults || []).map((v: any) => (
                    <option key={v.id} value={v.id}>#{v.id} {v.tokenSymbol}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                <label className="mb-1 block text-sm font-medium text-gray-700">Filtra per Affiliato</label>
                <select
                  value={tsReferrer ?? ''}
                  onChange={(e) => setTsReferrer(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tutti</option>
                  {Array.from(new Map((affiliatesQuery.data?.items || []).map((x: any) => [x.referrer?.id, x.referrer])).entries())
                    .filter(([id, ref]) => !!id && !!ref)
                    .map(([id, ref]: any) => (
                      <option key={id} value={id}>#{id} {ref.address.slice(0,10)}...{ref.address.slice(-8)}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Fee Owner (sparkline)</span>
                  </div>
                  <span className="text-xs text-gray-500">{tsDays} giorni</span>
                </div>
                {revenueTimeseriesQuery.isLoading ? (
                  <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
                ) : (
                  <Sparkline
                    values={(revenueTimeseriesQuery.data?.series || []).map(s => Number(BigInt(s.owner)) / 1e6)}
                    width={600}
                    height={120}
                    className="w-full"
                  />
                )}
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">Fee Affiliati (sparkline)</span>
                  </div>
                  <span className="text-xs text-gray-500">{tsDays} giorni</span>
                </div>
                {revenueTimeseriesQuery.isLoading ? (
                  <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
                ) : (
                  <Sparkline
                    values={(revenueTimeseriesQuery.data?.series || []).map(s => Number(BigInt(s.affiliate)) / 1e6)}
                    width={600}
                    height={120}
                    className="w-full"
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              {(() => {
                const series = revenueTimeseriesQuery.data?.series || [];
                const data = series.map(s => ({ owner: Number(BigInt(s.owner)) / 1e6, affiliate: Number(BigInt(s.affiliate)) / 1e6 }));
                const max = Math.max(1, ...data.map(d => d.owner + d.affiliate));
                const width = 600;
                const height = 160;
                const padding = 24;
                const barW = Math.max(6, Math.floor((width - padding * 2) / Math.max(1, data.length) - 4));
                const stepX = ((width - padding * 2) / Math.max(1, data.length));
                return (
                  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
                    {data.map((d, i) => {
                      const x = padding + i * stepX;
                      const hOwner = ((d.owner) / max) * (height - padding * 2);
                      const hAff = ((d.affiliate) / max) * (height - padding * 2);
                      const yOwner = height - padding - hOwner;
                      const yAff = yOwner - hAff;
                      return (
                        <g key={i}>
                          <rect x={x} y={yAff} width={barW} height={hAff} fill="#6366f1" />
                          <rect x={x} y={yOwner} width={barW} height={hOwner} fill="#10b981" />
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Top Affiliati</h2>
              {revenueByAffiliateQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
                  ))}
                </div>
              ) : (revenueByAffiliateQuery.data?.affiliates?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {revenueByAffiliateQuery.data!.affiliates.map((a) => (
                    <div key={a.referrerId} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                      <div>
                        <p className="font-medium text-gray-900">Affiliato #{a.referrerId}</p>
                        <p className="text-xs text-gray-500">Utenti: {a.usersCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${formatUSDC(a.affiliateProfitFees)}</p>
                        <p className="text-xs text-gray-500">Fee profitti</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">Nessun affiliato con ricavi</div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Ricavi per Vault</h2>
              {revenueByVaultQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200"></div>
                  ))}
                </div>
              ) : (revenueByVaultQuery.data?.vaults?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {revenueByVaultQuery.data!.vaults.map((v) => (
                    <div key={v.vaultId} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                      <div>
                        <p className="font-medium text-gray-900">Vault #{v.vaultId}</p>
                        <p className="text-xs text-gray-500">TVL ${formatUSDC(v.tvl)}</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${formatUSDC(v.ownerFeesTotal)}</p>
                          <p className="text-xs text-gray-500">Fee Owner</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${formatUSDC(v.affiliateFeesProfit)}</p>
                          <p className="text-xs text-gray-500">Fee Affiliati</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">Nessun ricavo per vault</div>
              )}
            </div>
          </div>
        )}

        {/* Profits tab removed for compliance */}
      </div>
    </div>
  );
}
  const prepareCreateVaultMutation = useMutation(
    trpc.prepareCreateVault.mutationOptions({
      onSuccess: async (res) => { if (res.success) { await sendTx(res.preparedTx as any); toast.success("CreateVault broadcasted"); } },
      onError: (error) => { toast.error(error.message || "Failed to prepare createVault"); }
    })
  );

  const syncVaultEventsMutation = useMutation(
    trpc.syncVaultEvents.mutationOptions({
      onSuccess: () => { toast.success("Vault events synced"); queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() }); },
      onError: (error) => { toast.error(error.message || "Failed to sync events"); }
    })
  );
