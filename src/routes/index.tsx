import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEthUsdPrice, formatWeiToUSD } from "~/utils/currency";
import { Navbar } from "~/components/Navbar";
import { StatCard } from "~/components/StatCard";
import { useTRPC } from "~/trpc/react";
import { useWalletStore } from "~/stores/walletStore";
import { 
  TrendingUp, 
  Vault, 
  Users, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  LayoutDashboard,
  Code,
  Layers,
  GitBranch,
  Lock,
  Percent,
  UserPlus,
  AlertTriangle
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const trpc = useTRPC();
  const { isConnected } = useWalletStore();
  const dashboardQuery = useQuery(trpc.getDashboardStats.queryOptions());

  const stats = dashboardQuery.data;
  const priceQuery = useEthUsdPrice();
  const toUSD = (wei: string) => (priceQuery.data ? formatWeiToUSD(wei, priceQuery.data) : "...");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">AI-Driven Yield Infrastructure</span>
            </div>
            <h1 className="mb-4 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              TRUDE
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-2xl font-semibold text-white sm:text-3xl">
              Yield API Layer: AI-Driven Finance. Shaping the Future of DeFi.
            </p>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-100">
              Advanced yield infrastructure for dApps, wallets, and protocols. 
              Plug into our vaults, deposit liquidity on behalf of your users, 
              and receive dynamic yield payouts automatically — with on-chain transparency.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {isConnected ? (
                <>
                  <Link
                    to="/dashboard"
                    className="group flex items-center space-x-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/vaults"
                    className="flex items-center space-x-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <Vault className="h-5 w-5" />
                    <span>Explore Vaults</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="group flex items-center space-x-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/developers"
                    className="flex items-center space-x-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <Code className="h-5 w-5" />
                    <span>For Developers</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Platform Overview</h2>
          <p className="mt-2 text-gray-600">Real-time statistics from the TRUDE ecosystem</p>
        </div>

        {stats?.isFallback && (
          <div className="mb-6 flex items-start space-x-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Database unavailable</h3>
              <p className="text-sm text-yellow-700">
                Showing demo statistics while the database is offline. Start Docker or set
                <code className="mx-1 rounded bg-yellow-100 px-1">DATABASE_URL</code> in <code className="rounded bg-yellow-100 px-1">.env</code>.
              </p>
            </div>
          </div>
        )}

        {dashboardQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={DollarSign}
              label="Total Value Locked"
              value={`$${toUSD(stats?.totalTVL || "0")}`}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={Vault}
              label="Active Vaults"
              value={stats?.vaultCount.toString() || "0"}
              subValue="Across all tokens"
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats?.userCount.toString() || "0"}
              subValue={`${stats?.affiliateCount || 0} affiliates`}
              gradient="from-purple-500 to-pink-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Profits"
              value={`$${toUSD(stats?.totalProfits || "0")}`}
              gradient="from-orange-500 to-red-600"
            />
          </div>
        )}

        {/* Quick Links Section */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200')] bg-cover bg-center opacity-10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <LayoutDashboard className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">Dashboard</h2>
              <p className="mb-6 text-lg text-blue-50">
                Manage your deposits, track profits, and withdraw earnings. Full control over your DeFi portfolio.
              </p>
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">Deposit & Withdraw</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Developers */}
          <Link
            to="/developers"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200')] bg-cover bg-center opacity-10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Code className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">Developers</h2>
              <p className="mb-6 text-lg text-purple-50">
                Integrate TRUDE into your dApp, wallet, or protocol. APIs, adapters, and smart contract interfaces.
              </p>
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">View Documentation</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Affiliates */}
          <Link
            to="/affiliates"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 p-8 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200')] bg-cover bg-center opacity-10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">Affiliates</h2>
              <p className="mb-6 text-lg text-green-50">
                Earn up to 50% commission on referrals. Access your affiliate link and track conversion stats.
              </p>
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">Join Program</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose TRUDE?</h2>
            <p className="mt-2 text-gray-600">Built for transparency, security, and scalability</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Non-Custodial Security</h3>
              <p className="text-gray-600">
                Funds remain in smart contracts under user control. TRUDE never holds custody, 
                ensuring maximum security and transparency.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Dynamic Fee Structure</h3>
              <p className="text-gray-600">
                Fair performance-based fees scale from 1% to 20% based on profit magnitude. 
                Pay only on realized gains.
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">AI-Driven Optimization</h3>
              <p className="text-gray-600">
                Advanced algorithms continuously optimize yield strategies across multiple protocols 
                to maximize returns.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Vaults */}
        {stats && stats.recentVaults.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Recent Vaults</h2>
                <p className="mt-2 text-gray-600">Latest vaults created on the platform</p>
              </div>
              <Link
                to="/vaults"
                className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats.recentVaults.map((vault) => (
                <Link
                  key={vault.id}
                  to="/vaults/$vaultId"
                  params={{ vaultId: vault.id.toString() }}
                  className="group flex items-center justify-between rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                      <Vault className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{vault.tokenSymbol} Vault</p>
                      <p className="text-sm text-gray-500">{vault.address.slice(0, 10)}...{vault.address.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">TVL</p>
                    <p className="text-lg font-bold text-gray-900">${priceQuery.data ? formatWeiToUSD(vault.tvl, priceQuery.data) : "..."}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
