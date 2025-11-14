import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEthUsdPrice, formatWeiToUSD } from "~/utils/currency";
import { Navbar } from "~/components/NavbarSupplyChain";
import { StatCard } from "~/components/StatCard";
import { useTRPC } from "~/trpc/react";
import { useWalletStore } from "~/stores/walletStore";
import { lazy, Suspense } from "react";
import { BlogList } from "~/components/BlogList";
import { getLatestBlogArticles } from "~/data/blog-articles";
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
  AlertTriangle,
  Target,
  Package,
  Globe,
  BarChart3,
  Clock,
  CheckCircle,
  Award,
  University,
  Trophy,
  Play,
  Calculator,
  BookOpen
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section - Supply Chain Focus */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">University Award Candidate</span>
            </div>
            <h1 className="mb-4 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              TruDe Supply Chain
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-2xl font-semibold text-blue-100 sm:text-3xl">
              Arbitraggio Commodities Reali con Tecnologia Blockchain Premium
            </p>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-blue-50">
              Dalla visione accademica di 20 anni fa alla realtà: prima piattaforma al mondo per 
              arbitraggio cross-chain su grano, oro, petrolio, caffè con oracoli Pyth in tempo reale. 
              Zero costi upfront, paghi solo sui profitti realizzati.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link
                to="/supply-chain/demo"
                className="group flex items-center space-x-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Play className="h-5 w-5" />
                <span>Prova Demo Gratuita</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/supply-chain/calculator"
                className="group flex items-center space-x-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Calculator className="h-5 w-5" />
                <span>Calcola ROI</span>
              </Link>
              <Link
                to="/university-award-strategy"
                className="group flex items-center space-x-2 rounded-xl border-2 border-yellow-400 bg-yellow-400/20 px-8 py-4 text-base font-semibold text-yellow-300 backdrop-blur-sm transition-all hover:bg-yellow-400/30"
              >
                <University className="h-5 w-5" />
                <span>Award Strategy</span>
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">0.1%</div>
                <div className="text-sm text-blue-200">Commissione</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">2-15s</div>
                <div className="text-sm text-blue-200">Execution</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">$45B</div>
                <div className="text-sm text-blue-200">Market Size</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">78-92%</div>
                <div className="text-sm text-blue-200">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Verticals */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Verticali Supply Chain Premium</h2>
          <p className="mt-4 text-xl text-gray-600">Tecnologia di arbitraggio per mercati da $45 miliardi</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Commodity Trading */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Commodity Trading</h3>
            <p className="mb-6 text-gray-600">
              Arbitraggio su grano, oro, petrolio, caffè con oracoli Pyth in tempo reale. 
              Identifichiamo inefficienze di prezzo tra mercati decentralizzati e centralizzati.
            </p>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Prezzi real-time da Pyth Network</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Arbitraggio cross-chain istantaneo</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Success rate: 78%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">$49</div>
                <div className="text-sm text-gray-600">Pay-per-use</div>
              </div>
              <div className="text-sm text-gray-500">Mercato: $20B</div>
            </div>
          </div>

          {/* Trade Finance */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Trade Finance</h3>
            <p className="mb-6 text-gray-600">
              Ottimizzazione del capitale circolante attraverso DeFi lending e yield farming. 
              Massimizziamo i rendimenti su fondi detenuti per operazioni di trade finance.
            </p>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Yield optimization automatica</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Risk assessment in tempo reale</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Success rate: 85%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">$99</div>
                <div className="text-sm text-gray-600">Pay-per-use</div>
              </div>
              <div className="text-sm text-gray-500">Mercato: $15B</div>
            </div>
          </div>

          {/* Carbon Credits */}
          <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Carbon Credits</h3>
            <p className="mb-6 text-gray-600">
              Arbitraggio su crediti di carbonio tokenizzati tra diverse blockchain e mercati. 
              Capitalizziamo differenze di prezzo su asset ESG ad alta crescita.
            </p>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Tokenizzazione carbon credits</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Mercati ESG cross-chain</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Success rate: 72%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">$79</div>
                <div className="text-sm text-gray-600">Pay-per-use</div>
              </div>
              <div className="text-sm text-gray-500">Mercato: $10B</div>
            </div>
          </div>
        </div>
      </div>

      {/* University Award Section */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <University className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">University Excellence Award</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Da Visione Accademica a Realtà Industriale
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-blue-100 mb-8">
              "20 anni fa volevo fare tesi su supply chain blockchain - non esisteva. Oggi ho creato 
              TruDe, candidandomi al premio excellence dell'università per innovazione nella supply chain."
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-white mb-2">20</div>
              <div className="text-sm text-blue-200">Anni di Visione</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-white mb-2">$45B</div>
              <div className="text-sm text-blue-200">Market Opportunity</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-white mb-2">0.1%</div>
              <div className="text-sm text-blue-200">Commissioni</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-white mb-2">78-92%</div>
              <div className="text-sm text-blue-200">Success Rate</div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/university-award-strategy"
              className="group inline-flex items-center space-x-3 rounded-xl bg-yellow-400 px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Award className="h-5 w-5" />
              <span>Strategia per vincere l'Award</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Tecnologia Premium</h2>
            <p className="mt-4 text-xl text-gray-600">Sicurezza, trasparenza e performance al massimo livello</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Sicurezza Multi-Livello</h3>
              <p className="text-sm text-gray-600">Audit trail immutabile, firme crittografiche, e compliance MiCA/GDPR/SOX</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Oracoli Pyth Premium</h3>
              <p className="text-sm text-gray-600">Prezzi real-time commodities con validazione multi-layer e circuit breaker</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Cross-Chain 5 Reti</h3>
              <p className="text-sm text-gray-600">Ethereum, Polygon, Arbitrum, Optimism, Base con arbitraggio istantaneo</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Recupero Errori</h3>
              <p className="text-sm text-gray-600">Circuit breaker, retry automatici e health monitoring in tempo reale</p>
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
          {/* Supply Chain Demo */}
          <Link
            to="/supply-chain/demo"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200')] bg-cover bg-center opacity-10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">Live Demo</h2>
              <p className="mb-6 text-lg text-green-50">
                Prova in tempo reale l'arbitraggio commodities con tecnologia TruDe Premium
              </p>
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">Testa la Tecnologia</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* ROI Calculator */}
          <Link
            to="/supply-chain/calculator"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200')] bg-cover bg-center opacity-10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">ROI Calculator</h2>
              <p className="mb-6 text-lg text-emerald-50">
                Calcola il potenziale ritorno sull'investimento con TruDe Supply Chain
              </p>
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">Calcola Profitti</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* University Award */}
          <Link
            to="/university-award-strategy"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 p-8 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200')] bg-cover bg-center opacity-10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">Award Strategy</h2>
              <p className="mb-6 text-lg text-yellow-50">
                Strategia per vincere il premio università excellence in supply chain innovation
              </p>
              <div className="flex items-center space-x-2 text-white">
                <span className="font-semibold">Vinci l'Award</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
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

      {/* Blog Section */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Latest Insights</h2>
              <p className="mt-4 text-xl text-gray-600">
                Discover how TruDe is revolutionizing supply chain management with AI and DeFi
              </p>
            </div>
            <Link
              to="/blog"
              className="group flex items-center space-x-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <BookOpen className="h-4 w-4" />
              <span>View All Articles</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <BlogList
            articles={getLatestBlogArticles(3)}
            showExcerpt={true}
            showTags={true}
            columns={3}
          />
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto per la Rivoluzione Supply Chain?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Inizia oggi con la demo gratuita. Nessun costo upfront, paghi solo sui profitti realizzati.
            Entra nel mercato da $45 miliardi con tecnologia premium e candidati all'award universitario.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/supply-chain/demo"
              className="group flex items-center space-x-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Play className="h-5 w-5" />
              <span>Prova Demo Gratuita</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/competitor-analysis"
              className="group flex items-center space-x-3 rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-slate-900"
            >
              <Target className="h-5 w-5" />
              <span>Conquista il Mercato</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span>University Award Candidate</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span>Global Impact</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span>Market Leadership</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
