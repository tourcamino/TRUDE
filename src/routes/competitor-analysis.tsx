import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  Shield,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Globe,
  Lock,
  Star
} from "lucide-react";

export const Route = createFileRoute("/competitor-analysis")({
  component: CompetitorAnalysisPage,
});

function CompetitorAnalysisPage() {
  const competitors = [
    {
      name: "dYdX",
      market: "Perpetual Trading",
      tvl: "$1.2B",
      weakness: "Nessun focus supply chain, solo crypto trading",
      strategy: "Offriamo arbitraggio reale su commodities, non solo crypto",
      attackVector: "Commodity-specific features, real-world asset integration"
    },
    {
      name: "GMX",
      market: "DEX Trading",
      tvl: "$800M", 
      weakness: "Zero integrazione con mercati reali, solo crypto nativi",
      strategy: "Pyth oracle integration per prezzi reali di commodities",
      attackVector: "Real-world price feeds, supply chain transparency"
    },
    {
      name: "Synthetix",
      market: "Synthetic Assets",
      tvl: "$600M",
      weakness: "Synth commodities non hanno backing reale, solo price tracking",
      strategy: "Arbitraggio su commodities fisiche con delivery reale possibile",
      attackVector: "Physical settlement, real supply chain integration"
    },
    {
      name: "Chainlink CCIP",
      market: "Cross-Chain",
      tvl: "N/A",
      weakness: "Costoso, complesso, nessun focus su supply chain",
      strategy: "Cross-chain semplificato per supply chain arbitrage",
      attackVector: "Supply-chain-optimized cross-chain, lower costs"
    },
    {
      name: "Pyth Network",
      market: "Oracle",
      tvl: "N/A",
      weakness: "Fornisce solo dati, nessuna esecuzione arbitrage",
      strategy: "Utilizziamo Pyth + eseguiamo arbitraggio automaticamente",
      attackVector: "End-to-end arbitrage execution, not just data"
    }
  ];

  const marketConquestStrategy = [
    {
      phase: "Fase 1: Penetrazione",
      timeline: "0-3 mesi",
      budget: "$50K",
      tactics: [
        "Target commodity traders con LinkedIn outreach personalizzato",
        "Free trial di 30 giorni per prime 100 aziende",
        "Content marketing: case studies su arbitraggio grano/oro",
        "Partnership con associazioni di categoria (Assograno, Federorafi)",
        "Webinar settimanali su 'Arbitraggio commodities con DeFi'"
      ],
      kpis: "100 utenti attivi, $500K volume, 10% conversione"
    },
    {
      phase: "Fase 2: Espansione", 
      timeline: "3-9 mesi",
      budget: "$150K",
      tactics: [
        "Referral program: 20% commissione su nuovi clienti",
        "Enterprise sales per aziende >$10M revenue",
        "White-label solution per banche e istituzioni",
        "Integration con ERP aziendali (SAP, Oracle)",
        "Conference speaking: Vinitaly, Fiera di Genova commodities"
      ],
      kpis: "1,000 utenti, $5M volume, 25% market share nicchia"
    },
    {
      phase: "Fase 3: Dominanza",
      timeline: "9-18 mesi", 
      budget: "$300K",
      tactics: [
        "Acquisition di competitor più piccoli",
        "Global expansion: EU first, poi Asia/US",
        "Regulatory approval: MiCA compliance premium",
        "Strategic partnerships con major commodity exchanges",
        "Patent filing su algoritmi arbitrage proprietari"
      ],
      kpis: "10,000 utenti, $50M volume, 60% market share"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900 via-orange-900 to-yellow-900 py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Target className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Market Conquest Strategy</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              Strategia di Conquista
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-2xl font-semibold text-orange-100 sm:text-3xl">
              Analisi Competitor + Piano per Dominare il Mercato Supply Chain
            </p>
            <p className="mx-auto mb-12 max-w-3xl text-lg text-orange-50">
              Identifichiamo i competitor, analizziamo le loro debolezze, e costruiamo una strategia aggressiva 
              per rubare loro i clienti e conquistare la quota di mercato nel supply chain arbitrage.
            </p>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Il Mercato è Nostro</h2>
          <p className="mt-4 text-xl text-gray-600">$45B di opportunità con competitor deboli e lenti</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 p-8 shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Mercato Inefficiente</h3>
            <p className="mb-6 text-gray-600">
              I competitor si concentrano solo su crypto trading. Nessuno si occupa di commodities reali 
              con arbitraggio cross-chain. Lasciano $45B di opportunità sul tavolo.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-gray-700">Nessun focus supply chain</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-gray-700">Zero integrazione commodities reali</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-gray-700">Costi altissimi (0.5-2% vs nostri 0.1%)</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Nostri Vantaggi</h3>
            <p className="mb-6 text-gray-600">
              Tecnologia premium con oracoli Pyth, arbitraggio istantaneo, costi ultra-bassi. 
              Siamo 10x più veloci e 20x più economici dei competitor.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">2-15 secondi vs 2-15 minuti</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">0.1% commissione vs 0.5-2%</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Real commodity arbitrage</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Target di Mercato</h3>
            <p className="mb-6 text-gray-600">
              Commodity traders, aziende di supply chain, fondi di investimento. 
              50,000 potenziali clienti in EU con budget $10K-1M annui.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Commodity Traders</span>
                <span className="text-sm font-semibold text-blue-600">15,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Supply Chain Companies</span>
                <span className="text-sm font-semibold text-blue-600">25,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Investment Funds</span>
                <span className="text-sm font-semibold text-blue-600">10,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Competitor Analysis</h2>
            <p className="mt-4 text-xl text-gray-600">Le loro debolezze sono le nostre opportunità</p>
          </div>

          <div className="space-y-8">
            {competitors.map((competitor, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <div className="mb-4 flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{competitor.name}</h3>
                        <p className="text-gray-600">{competitor.market} • {competitor.tvl}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold text-red-600">Debolezza Critica:</h4>
                      <p className="text-gray-700">{competitor.weakness}</p>
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold text-green-600">Nostro Vantaggio:</h4>
                      <p className="text-gray-700">{competitor.strategy}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="mb-6">
                      <h4 className="mb-3 font-semibold text-blue-600">Attack Vector:</h4>
                      <div className="rounded-xl bg-blue-50 p-4">
                        <p className="text-sm text-blue-900">{competitor.attackVector}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Priority Target #{index + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Conquest Strategy */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-white">Strategia di Conquista Dettagliata</h2>
            <p className="mt-4 text-xl text-blue-100">18 mesi per dominare il mercato supply chain</p>
          </div>

          <div className="space-y-12">
            {marketConquestStrategy.map((phase, index) => (
              <div key={index} className="rounded-3xl bg-white/10 p-8 backdrop-blur-sm">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{phase.phase}</h3>
                      <p className="text-green-200">{phase.timeline} • Budget: {phase.budget}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{phase.kpis}</div>
                    <div className="text-sm text-blue-200">KPIs Target</div>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-white">Tattiche di Attacco:</h4>
                    <div className="space-y-3">
                      {phase.tactics.map((tactic, tacticIndex) => (
                        <div key={tacticIndex} className="flex items-start space-x-3">
                          <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                          <span className="text-sm text-blue-100">{tactic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="rounded-2xl bg-white/20 p-6">
                      <h4 className="mb-3 font-semibold text-yellow-300">Focus Strategico:</h4>
                      <p className="text-sm text-white">
                        {index === 0 && "Concentriamoci su commodity traders individuali e piccole aziende. Prezzo aggressivo e free trial per superare la resistenza al cambiamento."}
                        {index === 1 && "Scale up con enterprise sales e partnerships. White-label per banche che vogliono offrire commodity trading ai clienti."}
                        {index === 2 && "Dominio del mercato attraverso acquisizioni, espansione globale, e barriere competitive regulatory/technology."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Acquisition Tactics */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Tattiche di Customer Acquisition</h2>
            <p className="mt-4 text-xl text-gray-600">Rubare clienti dai competitor con precisione chirurgica</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-red-50 to-pink-50 p-8 shadow-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-600">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Customer Poaching Strategy</h3>
              
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h4 className="mb-2 font-semibold text-red-600">LinkedIn Precision Targeting</h4>
                  <p className="text-sm text-gray-700">Target commodity traders su dYdX, GMX con messaggi personalizzati: "Ti piacerebbe arbitrare grano reale oltre Bitcoin?"</p>
                </div>
                
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h4 className="mb-2 font-semibold text-red-600">Discord/Telegram Infiltration</h4>
                  <p className="text-sm text-gray-700">Entriamo nei loro community, dimostriamo superiorità tecnologica con dati reali</p>
                </div>
                
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h4 className="mb-2 font-semibold text-red-600">Direct Comparison Campaign</h4>
                  <p className="text-sm text-gray-700">"Hai fatto $10K su dYdX? Con TruDe avresti fatto $50K su commodities reali"</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Pricing War Strategy</h3>
              
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h4 className="mb-2 font-semibold text-blue-600">Costi 10x Inferiori</h4>
                  <p className="text-sm text-gray-700">0.1% vs 0.5-2% competitor. Su $1M trade: $1K vs $5K-20K commissioni</p>
                </div>
                
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h4 className="mb-2 font-semibold text-blue-600">Success Fee Only</h4>
                  <p className="text-sm text-gray-700">Paghi solo su profitti realizzati. Nessun costo upfront vs competitor</p>
                </div>
                
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <h4 className="mb-2 font-semibold text-blue-600">Volume Incentives</h4>
                  <p className="text-sm text-gray-700">Commissione scende a 0.05% sopra $10M mensili. Blockbuster per enterprise</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-slate-900 to-red-900 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto per la Guerra di Mercato?
          </h2>
          <p className="text-xl text-red-100 mb-10">
            Abbiamo identificato i competitor, le loro debolezze, e costruito una strategia di conquista. 
            Ora passiamo all'attacco e prendiamoci il mercato da $45 miliardi.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/supply-chain/demo"
              className="group flex items-center space-x-3 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-red-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Play className="h-5 w-5" />
              <span>Inizia l'Attacco</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/api-documentation"
              className="group flex items-center space-x-3 rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-red-900"
            >
              <Globe className="h-5 w-5" />
              <span>Strategia Completa</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-red-200">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-yellow-400" />
              <span>Precision Targeting</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>Shock Pricing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-400" />
              <span>Superior Technology</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}