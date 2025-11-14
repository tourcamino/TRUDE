import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Play,
  Calculator,
  Users,
  Award,
  Target
} from "lucide-react";

export const Route = createFileRoute("/supply-chain")({
  component: SupplyChainPage,
});

function SupplyChainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section - Supply Chain Focus */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Target className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Supply Chain Arbitrage Revolution</span>
            </div>
            <h1 className="mb-6 text-6xl font-bold text-white sm:text-7xl lg:text-8xl">
              TruDe Supply Chain
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-2xl font-semibold text-blue-100 sm:text-3xl">
              Arbitraggio su Commodities Reali con Tecnologia Blockchain Premium
            </p>
            <p className="mx-auto mb-12 max-w-3xl text-lg text-blue-50">
              Sfrutta le inefficienze del mercato delle commodities (grano, oro, petrolio, caffè) attraverso 
              arbitraggio cross-chain con oracoli Pyth in tempo reale. Zero costi upfront, paghi solo sui profitti realizzati.
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
                to="/supply-chain/calculator"
                className="group flex items-center space-x-3 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Calculator className="h-5 w-5" />
                <span>Calcola ROI</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">0.1%</div>
            <div className="text-sm text-gray-600">Commissione sui Profitti</div>
            <div className="mt-2 text-xs text-green-600">Più bassa del mercato</div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">2-15s</div>
            <div className="text-sm text-gray-600">Tempo di Esecuzione</div>
            <div className="mt-2 text-xs text-blue-600">Ultra-veloce</div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-600">Trasparenza</div>
            <div className="mt-2 text-xs text-purple-600">Tutte le transazioni verificabili</div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">78-92%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="mt-2 text-xs text-orange-600">Dipende dal vertical</div>
          </div>
        </div>
      </div>

      {/* Supply Chain Verticals */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      </div>

      {/* Technology Stack */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-white">Tecnologia Premium</h2>
            <p className="mt-4 text-xl text-blue-100">Sicurezza, trasparenza e performance al massimo livello</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Sicurezza Multi-Livello</h3>
              <p className="text-sm text-blue-100">Audit trail immutabile, firme crittografiche, e compliance MiCA/GDPR/SOX</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Oracoli Pyth Premium</h3>
              <p className="text-sm text-blue-100">Prezzi real-time commodities con validazione multi-layer e circuit breaker</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Cross-Chain 5 Reti</h3>
              <p className="text-sm text-blue-100">Ethereum, Polygon, Arbitrum, Optimism, Base con arbitraggio istantaneo</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Recupero Errori</h3>
              <p className="text-sm text-blue-100">Circuit breaker, retry automatici e health monitoring in tempo reale</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Pronto per la Rivoluzione Supply Chain?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Inizia oggi con la demo gratuita. Nessun costo upfront, paghi solo sui profitti realizzati.
            Entra nel mercato da $45 miliardi con tecnologia premium.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/supply-chain/demo"
              className="group flex items-center space-x-3 rounded-xl bg-gradient-to-r from-slate-900 to-blue-900 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Play className="h-5 w-5" />
              <span>Prova Demo Gratuita</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/api-documentation"
              className="group flex items-center space-x-3 rounded-xl border-2 border-slate-900 px-8 py-4 text-lg font-semibold text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
            >
              <Code className="h-5 w-5" />
              <span>Documentazione API</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-600" />
              <span>Tecnologia Audit-Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Enterprise Grade</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span>Sicurezza Massima</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}