import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Play, 
  Pause, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  BarChart3,
  Package
} from "lucide-react";

export const Route = createFileRoute("/supply-chain/demo")({
  component: SupplyChainDemo,
});

function SupplyChainDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [commodity, setCommodity] = useState("GOLD");
  const [network, setNetwork] = useState("ethereum");
  const [arbitrageResults, setArbitrageResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const commodities = {
    GOLD: { name: "Oro", price: 2045.50, spread: 2.3, volatility: "Low" },
    OIL: { name: "Petrolio", price: 78.90, spread: 1.8, volatility: "High" },
    WHEAT: { name: "Grano", price: 6.45, spread: 3.1, volatility: "Medium" },
    COFFEE: { name: "Caffè", price: 1.85, spread: 4.2, volatility: "High" }
  };

  const networks = {
    ethereum: { name: "Ethereum", gas: 45, speed: "Medium" },
    polygon: { name: "Polygon", gas: 0.5, speed: "Fast" },
    arbitrum: { name: "Arbitrum", gas: 2.1, speed: "Fast" },
    optimism: { name: "Optimism", gas: 1.8, speed: "Fast" },
    base: { name: "Base", gas: 0.8, speed: "Ultra Fast" }
  };

  const demoSteps = [
    { 
      id: 1, 
      title: "Oracle Price Feed", 
      description: "Raccolta prezzi real-time da Pyth Network",
      duration: 2000,
      status: "pending"
    },
    { 
      id: 2, 
      title: "Cross-Chain Analysis", 
      description: "Analisi opportunità tra 5 blockchain",
      duration: 3000,
      status: "pending"
    },
    { 
      id: 3, 
      title: "Risk Assessment", 
      description: "Valutazione volatilità e liquidità",
      duration: 1500,
      status: "pending"
    },
    { 
      id: 4, 
      title: "Arbitrage Execution", 
      description: "Esecuzione simultanea cross-chain",
      duration: 4000,
      status: "pending"
    },
    { 
      id: 5, 
      title: "Profit Realization", 
      description: "Chiusura posizioni e calcolo profitto",
      duration: 2000,
      status: "pending"
    }
  ];

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-10));
  };

  const runDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setArbitrageResults(null);
    setLogs([]);

    addLog(`🚀 Starting ${commodity} arbitrage on ${network}`);
    addLog("📊 Fetching real-time prices from Pyth Network...");

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      addLog(`⏳ ${demoSteps[i].title}: ${demoSteps[i].description}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, demoSteps[i].duration));
      
      addLog(`✅ ${demoSteps[i].title} completed`);
    }

    // Simulate arbitrage results
    const basePrice = commodities[commodity as keyof typeof commodities].price;
    const spread = commodities[commodity as keyof typeof commodities].spread;
    const profit = (basePrice * spread / 100) * (1 + Math.random() * 0.5);
    const gasCost = networks[network as keyof typeof networks].gas * 0.01;
    const netProfit = profit - gasCost;

    setArbitrageResults({
      profit: profit.toFixed(2),
      gasCost: gasCost.toFixed(2),
      netProfit: netProfit.toFixed(2),
      roi: ((netProfit / gasCost) * 100).toFixed(1),
      executionTime: (12 + Math.random() * 6).toFixed(1)
    });

    addLog(`💰 Arbitrage completed! Net profit: $${netProfit.toFixed(2)}`);
    setIsRunning(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setArbitrageResults(null);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Supply Chain Demo
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
              Prova in tempo reale l'arbitraggio commodities con tecnologia TruDe Premium
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Configurazione Demo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Commodity</label>
                  <select 
                    value={commodity} 
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    disabled={isRunning}
                  >
                    {Object.entries(commodities).map(([key, data]) => (
                      <option key={key} value={key}>{data.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Blockchain</label>
                  <select 
                    value={network} 
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    disabled={isRunning}
                  >
                    {Object.entries(networks).map(([key, data]) => (
                      <option key={key} value={key}>{data.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={runDemo}
                    disabled={isRunning}
                    className="flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-white transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isRunning ? 'Running...' : 'Start Demo'}</span>
                  </button>
                  
                  <button
                    onClick={resetDemo}
                    className="flex items-center justify-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Market Data */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Market Data</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-semibold">${commodities[commodity as keyof typeof commodities].price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Spread:</span>
                  <span className="font-semibold text-green-600">+{commodities[commodity as keyof typeof commodities].spread}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volatility:</span>
                  <span className="font-semibold">{commodities[commodity as keyof typeof commodities].volatility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gas Cost:</span>
                  <span className="font-semibold">${networks[network as keyof typeof networks].gas * 0.01}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Execution */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Demo Execution</h3>
              
              <div className="space-y-3">
                {demoSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`rounded-lg border p-4 transition-all ${
                      index < currentStep ? 'border-green-200 bg-green-50' :
                      index === currentStep && isRunning ? 'border-blue-200 bg-blue-50 animate-pulse' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        index < currentStep ? 'bg-green-600' :
                        index === currentStep && isRunning ? 'bg-blue-600' :
                        'bg-gray-300'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : index === currentStep && isRunning ? (
                          <Zap className="h-4 w-4 text-white animate-bounce" />
                        ) : (
                          <span className="text-sm font-semibold text-white">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            {arbitrageResults && (
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Arbitrage Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white p-4">
                    <div className="text-sm text-gray-600">Gross Profit</div>
                    <div className="text-2xl font-bold text-green-600">${arbitrageResults.profit}</div>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="text-sm text-gray-600">Net Profit</div>
                    <div className="text-2xl font-bold text-green-700">${arbitrageResults.netProfit}</div>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="text-sm text-gray-600">ROI</div>
                    <div className="text-2xl font-bold text-blue-600">{arbitrageResults.roi}%</div>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="text-sm text-gray-600">Execution Time</div>
                    <div className="text-2xl font-bold text-purple-600">{arbitrageResults.executionTime}s</div>
                  </div>
                </div>
                
                <div className="mt-4 rounded-lg bg-white p-4">
                  <div className="text-sm text-gray-600">Gas Cost</div>
                  <div className="text-lg font-semibold text-gray-900">${arbitrageResults.gasCost}</div>
                </div>
              </div>
            )}
          </div>

          {/* Live Logs */}
          <div className="rounded-2xl bg-slate-900 p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-white">Live Transaction Logs</h3>
            <div className="h-64 overflow-y-auto rounded-lg bg-black p-4 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">Click "Start Demo" to begin...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 text-green-400">
                    {log}
                  </div>
                ))
              )}
            </div>
            
            {isRunning && (
              <div className="mt-4 flex items-center space-x-2 text-sm text-blue-400">
                <div className="h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
                <span>Processing arbitrage...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Tecnologia Premium in Azione</h2>
            <p className="mt-4 text-xl text-gray-600">Caratteristiche che rendono TruDe superiore ai competitor</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">2-15 Secondi</h3>
              <p className="text-sm text-gray-600">Execution time 10x più veloce di dYdX, GMX e altri competitor</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">0.1% Commissione</h3>
              <p className="text-sm text-gray-600">20x più economico di Synthetix (2%) e 5x più di dYdX (0.5%)</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">5 Blockchain</h3>
              <p className="text-sm text-gray-600">Cross-chain arbitrage su Ethereum, Polygon, Arbitrum, Optimism, Base</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}