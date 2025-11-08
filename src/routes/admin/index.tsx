import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
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
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "vaults">("overview");
  const [adminToken, setAdminToken] = useState("");

  const settingsQuery = useQuery(trpc.getFactorySettings.queryOptions());
  const dashboardQuery = useQuery(trpc.getDashboardStats.queryOptions());
  const vaultsQuery = useQuery(trpc.getVaults.queryOptions({}));

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

  const onSubmitVault = (data: CreateVaultForm) => {
    createVaultMutation.mutate(data);
  };

  // Profits submit handler removed for compliance

  const formatEther = (wei: string) => {
    const ether = Number(BigInt(wei) / BigInt(1e18));
    return ether.toLocaleString(undefined, { maximumFractionDigits: 4 });
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
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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

        {/* Profits tab removed for compliance */}
      </div>
    </div>
  );
}
