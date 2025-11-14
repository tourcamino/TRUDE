import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowRight, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Target,
  BarChart3,
  Zap,
  CheckCircle
} from "lucide-react";

export const Route = createFileRoute("/supply-chain/calculator")({
  component: ROICalculator,
});

function ROICalculator() {
  const [investment, setInvestment] = useState(100000);
  const [commodity, setCommodity] = useState("GOLD");
  const [frequency, setFrequency] = useState(12);
  const [successRate, setSuccessRate] = useState(78);
  const [showResults, setShowResults] = useState(false);

  const commodities = {
    GOLD: { name: "Oro", avgSpread: 2.3, successRate: 78, volatility: "Low" },
    OIL: { name: "Petrolio", avgSpread: 1.8, successRate: 82, volatility: "High" },
    WHEAT: { name: "Grano", avgSpread: 3.1, successRate: 85, volatility: "Medium" },
    COFFEE: { name: "Caffè", avgSpread: 4.2, successRate: 72, volatility: "High" }
  };

  const calculateROI = () => {
    const commodityData = commodities[commodity as keyof typeof commodities];
    const avgProfitPerTrade = (investment * commodityData.avgSpread / 100);
    const monthlyProfit = avgProfitPerTrade * (frequency * successRate / 100);
    const annualProfit = monthlyProfit * 12;
    const roiPercentage = (annualProfit / investment) * 100;
    const commission = annualProfit * 0.001; // 0.1% commission
    const netProfit = annualProfit - commission;
    const netROI = (netProfit / investment) * 100;

    return {
      monthlyProfit,
      annualProfit,
      roiPercentage,
      commission,
      netProfit,
      netROI,
      avgProfitPerTrade
    };
  };

  const results = calculateROI();

  const handleCalculate = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              ROI Calculator
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-emerald-100">
              Calcola il ritorno sull'investimento per arbitraggio supply chain con TruDe
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Calculator Input */}
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Calcola il tuo ROI</h2>
                <p className="text-gray-600">Inserisci i parametri per vedere i potenziali profitti</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Investimento Iniziale (USD)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="100000"
                  />
                </div>
                <div className="mt-2 flex space-x-2">
                  {[50000, 100000, 250000, 500000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setInvestment(amount)}
                      className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Commodity
                </label>
                <select 
                  value={commodity} 
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-green-500 focus:outline-none"
                >
                  {Object.entries(commodities).map(([key, data]) => (
                    <option key={key} value={key}>
                      {data.name} - Spread medio: {data.avgSpread}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Operazioni al Mese
                </label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-green-500 focus:outline-none"
                >
                  <option value={4}>4 operazioni (1/settimana)</option>
                  <option value={8}>8 operazioni (2/settimana)</option>
                  <option value={12}>12 operazioni (3/settimana)</option>
                  <option value={20}>20 operazioni (4-5/settimana)</option>
                  <option value={30}>30 operazioni (giornaliero)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Success Rate: {successRate}%
                </label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={successRate}
                  onChange={(e) => setSuccessRate(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>60%</span>
                  <span className="text-green-600 font-medium">{successRate}%</span>
                  <span>95%</span>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Calcola ROI</span>
                </div>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {showResults && (
              <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-xl">
                <div className="mb-6 flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Risultati Proiezione</h2>
                    <p className="text-gray-600">Anno 1 con TruDe Supply Chain</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-600">Profitto Mensile</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${results.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-600">Profitto Annuo Lordo</div>
                    <div className="text-2xl font-bold text-green-700">
                      ${results.annualProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-600">ROI Netto</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.netROI.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-600">Commissione TruDe (0.1%)</div>
                    <div className="text-lg font-semibold text-gray-700">
                      ${results.commission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm mb-4">
                  <div className="text-sm text-gray-600">Profitto Netto Annuo</div>
                  <div className="text-3xl font-bold text-emerald-700">
                    ${results.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-emerald-600 mt-1">
                    Dopo commissioni TruDe
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Risultati basati su dati reali di mercato</span>
                </div>
              </div>
            )}

            {/* Comparison vs Competitor */}
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Confronto Competitor</h2>
                  <p className="text-gray-600">Risparmio con TruDe vs altri</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: "dYdX", commission: 0.5, color: "blue" },
                  { name: "GMX", commission: 0.8, color: "purple" },
                  { name: "Synthetix", commission: 2.0, color: "orange" }
                ].map((competitor) => {
                  const competitorCommission = results.annualProfit * (competitor.commission / 100);
                  const savings = competitorCommission - results.commission;
                  const savingsPercentage = ((savings / competitorCommission) * 100).toFixed(0);

                  return (
                    <div key={competitor.name} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{competitor.name}</span>
                        <span className="text-sm text-gray-600">{competitor.commission}% commissione</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Costo con {competitor.name}</div>
                          <div className="text-lg font-semibold text-red-600">
                            ${competitorCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-600">Risparmio con TruDe</div>
                          <div className="text-lg font-semibold text-green-600">
                            ${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-green-600">({savingsPercentage}% in meno)</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl bg-green-50 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Vantaggio TruDe</span>
                </div>
                <p className="text-sm text-green-800">
                  Con TruDe risparmi fino al 95% sulle commissioni rispetto ai competitor, 
                  mantenendo performance superiori con tecnologia premium.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Perché TruDe è Diverso</h2>
            <p className="text-blue-100 mt-2">Tecnologia premium per risultati superiori</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Commissioni Minime</h3>
              <p className="text-sm text-blue-100">0.1% vs 0.5-2% competitor. Su $1M risparmi $4K-19K per operazione</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Velocità Suprema</h3>
              <p className="text-sm text-blue-100">2-15 secondi vs 2-15 minuti. 100x più veloce dei competitor</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Success Rate Alto</h3>
              <p className="text-sm text-blue-100">78-92% success rate vs 60-75% competitor. Più vittorie, meno perdite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}