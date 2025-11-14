// Analisi Sostenibilità Modello Fee TRUDE
// Performance Fee: 10-30% dinamico + 0% withdrawal fee

export interface FeeSustainabilityData {
  dailyProfitTarget: number;
  averageAUM: number;
  userCount: number;
  performanceFeeRate: number;
  monthlyRevenue: number;
  breakEvenPoint: number;
  sustainabilityScore: number;
}

export class FeeSustainabilityAnalyzer {
  
  // Scenario base: target 1% profitto giornaliero
  calculateBaseScenario(aum: number = 1000000): FeeSustainabilityData {
    const dailyProfit = aum * 0.01; // 1% daily target
    const monthlyProfit = dailyProfit * 30;
    const performanceFeeRate = this.calculateDynamicFeeRate(dailyProfit);
    const monthlyRevenue = monthlyProfit * performanceFeeRate;
    
    return {
      dailyProfitTarget: 1,
      averageAUM: aum,
      userCount: Math.floor(aum / 5000), //假设平均用户投资 $5000
      performanceFeeRate,
      monthlyRevenue,
      breakEvenPoint: this.calculateBreakEvenPoint(aum),
      sustainabilityScore: this.calculateSustainabilityScore(monthlyRevenue, aum)
    };
  }

  // Calcola fee rate dinamico basato su performance
  calculateDynamicFeeRate(dailyProfit: number): number {
    const profitPercentage = (dailyProfit / 100) * 100; //假设 base 100k
    
    if (profitPercentage <= 0.5) return 0.10; // 10% per profitti bassi
    if (profitPercentage <= 1.0) return 0.15; // 15% per profitti medi
    if (profitPercentage <= 2.0) return 0.20; // 20% per profitti alti
    if (profitPercentage <= 3.0) return 0.25; // 25% per profitti molto alti
    return 0.30; // 30% per profitti eccezionali >3%
  }

  // Calcola punto di break-even
  calculateBreakEvenPoint(aum: number): number {
    const operationalCosts = 15000; // Costi mensili operativi stimati
    const minimumRevenue = operationalCosts * 1.5; // 50% margine di sicurezza
    
    // Quanto AUM serve per generare minimumRevenue con fee dinamiche?
    let testAUM = 100000;
    while (testAUM <= 10000000) {
      const scenario = this.calculateBaseScenario(testAUM);
      if (scenario.monthlyRevenue >= minimumRevenue) {
        return testAUM;
      }
      testAUM += 50000;
    }
    return 10000000; // Default se non trovato
  }

  // Calcola score di sostenibilità (1-10)
  calculateSustainabilityScore(monthlyRevenue: number, aum: number): number {
    const revenueRatio = monthlyRevenue / aum;
    const operationalMargin = 0.6; //假设 60% margine operativo
    
    if (revenueRatio >= 0.02) return 9; // Ottimo
    if (revenueRatio >= 0.015) return 8; // Molto buono
    if (revenueRatio >= 0.01) return 7; // Buono
    if (revenueRatio >= 0.008) return 6; // Sufficiente
    if (revenueRatio >= 0.005) return 5; // Marginale
    return Math.max(1, revenueRatio * 1000); // Insufficiente
  }

  // Analisi sensitività per diversi scenari
  sensitivityAnalysis(): Record<string, FeeSustainabilityData> {
    const scenarios = {
      'bearish': 0.005,   // 0.5% daily profit
      'conservative': 0.008, // 0.8% daily profit
      'target': 0.01,     // 1% daily profit (target)
      'optimistic': 0.015, // 1.5% daily profit
      'bullish': 0.02     // 2% daily profit
    };

    const results: Record<string, FeeSustainabilityData> = {};
    
    Object.entries(scenarios).forEach(([name, profitRate]) => {
      const aum = 1000000;
      const dailyProfit = aum * profitRate;
      const monthlyProfit = dailyProfit * 30;
      const feeRate = this.calculateDynamicFeeRate(dailyProfit);
      
      results[name] = {
        dailyProfitTarget: profitRate * 100,
        averageAUM: aum,
        userCount: Math.floor(aum / 5000),
        performanceFeeRate: feeRate,
        monthlyRevenue: monthlyProfit * feeRate,
        breakEvenPoint: this.calculateBreakEvenPoint(aum),
        sustainabilityScore: this.calculateSustainabilityScore(monthlyProfit * feeRate, aum)
      };
    });

    return results;
  }

  // Confronto con competitors
  compareWithCompetitors(): {
    trude: { performanceFee: number; withdrawFee: number; totalCost: number };
    competitors: Record<string, { performanceFee: number; withdrawFee: number; totalCost: number }>;
  } {
    const dailyProfit = 10000; //假设日利润
    const trudeFeeRate = this.calculateDynamicFeeRate(dailyProfit);
    
    return {
      trude: {
        performanceFee: dailyProfit * trudeFeeRate,
        withdrawFee: 0,
        totalCost: dailyProfit * trudeFeeRate
      },
      competitors: {
        yearn: {
          performanceFee: dailyProfit * 0.20, // 20%
          withdrawFee: dailyProfit * 0.005, // 0.5%
          totalCost: dailyProfit * 0.205
        },
        aave: {
          performanceFee: dailyProfit * 0.15, // 15% su yield
          withdrawFee: 0,
          totalCost: dailyProfit * 0.15
        },
        compound: {
          performanceFee: dailyProfit * 0.18, // ~18% effective
          withdrawFee: dailyProfit * 0.003, // 0.3%
          totalCost: dailyProfit * 0.183
        }
      }
    };
  }
}

// Export per dashboard
export const feeAnalyzer = new FeeSustainabilityAnalyzer();

// Dati per UI
export const getSustainabilityMetrics = () => {
  const baseAnalysis = feeAnalyzer.calculateBaseScenario();
  const sensitivity = feeAnalyzer.sensitivityAnalysis();
  const competitorComparison = feeAnalyzer.compareWithCompetitors();
  
  return {
    current: baseAnalysis,
    scenarios: sensitivity,
    comparison: competitorComparison,
    recommendation: generateRecommendation(baseAnalysis, sensitivity)
  };
};

function generateRecommendation(
  current: FeeSustainabilityData,
  scenarios: Record<string, FeeSustainabilityData>
): string {
  if (current.sustainabilityScore >= 8) {
    return "Modello altamente sostenibile. Focus su crescita utenti.";
  } else if (current.sustainabilityScore >= 6) {
    return "Modello sostenibile con margine migliorabile. Considerare ottimizzazioni.";
  } else {
    return "Modello marginalmente sostenibile. Necessario aumentare AUM o performance.";
  }
}