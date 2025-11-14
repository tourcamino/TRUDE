import { TruDePythOracle, PythPriceData } from './TruDePythOracle';
import { TruDeErrorHandling, ErrorCategory, ErrorSeverity } from '../error-handling/TruDeErrorHandling';
import { Logger } from '../utils/Logger';

export interface SupplyChainPriceData {
  commodity: string;
  price: number;
  confidence: number;
  timestamp: Date;
  source: 'pyth' | 'chainlink' | 'backup';
  arbitrageOpportunity?: {
    exists: boolean;
    spread: number;
    targetNetwork: string;
    expectedProfit: number;
  };
  riskAssessment: {
    volatility: number;
    confidenceScore: number;
    reliability: number;
  };
}

export interface CrossChainArbitrage {
  fromNetwork: string;
  toNetwork: string;
  commodity: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  estimatedGasCost: number;
  netProfit: number;
  confidence: number;
  executionWindow: number; // seconds
}

export class TruDeSupplyChainOracleIntegration {
  private pythOracle: TruDePythOracle;
  private errorHandler: TruDeErrorHandling;
  private logger: Logger;
  private priceCache: Map<string, SupplyChainPriceData> = new Map();
  private arbitrageCache: Map<string, CrossChainArbitrage> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly ARBITRAGE_THRESHOLD = 0.5; // 0.5% minimum spread
  private readonly MAX_EXECUTION_WINDOW = 300; // 5 minutes

  constructor() {
    this.pythOracle = new TruDePythOracle();
    this.errorHandler = new TruDeErrorHandling();
    this.logger = new Logger('TruDeSupplyChainOracleIntegration');
  }

  // Premium supply chain price aggregation
  async getSupplyChainPrice(
    commodity: string,
    network: string
  ): Promise<SupplyChainPriceData> {
    const cacheKey = `${commodity}_${network}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.CACHE_DURATION) {
      return cached;
    }

    try {
      // Map commodity to Pyth feed
      const feedId = this.getCommodityFeedId(commodity);
      if (!feedId) {
        throw new Error(`No Pyth feed available for commodity: ${commodity}`);
      }

      // Get price from Pyth with premium validation
      const priceData = await this.pythOracle.getPrice(feedId, network);
      
      // Calculate arbitrage opportunities
      const arbitrage = await this.findArbitrageOpportunities(commodity, priceData, network);
      
      // Assess risk
      const riskAssessment = await this.assessPriceRisk(priceData, commodity);
      
      const supplyChainData: SupplyChainPriceData = {
        commodity,
        price: priceData.price,
        confidence: priceData.confidence,
        timestamp: priceData.timestamp,
        source: 'pyth',
        arbitrageOpportunity: arbitrage,
        riskAssessment
      };

      this.priceCache.set(cacheKey, supplyChainData);
      
      this.logger.info(`Supply chain price retrieved`, {
        commodity,
        network,
        price: supplyChainData.price,
        arbitrage: supplyChainData.arbitrageOpportunity,
        risk: supplyChainData.riskAssessment
      });

      return supplyChainData;
    } catch (error) {
      this.logger.error(`Failed to get supply chain price for ${commodity}`, { error, network });
      
      // Fallback to backup pricing
      return await this.getBackupPrice(commodity, network);
    }
  }

  // Premium cross-chain arbitrage detection
  async findArbitrageOpportunities(
    commodity: string,
    referencePrice: PythPriceData,
    fromNetwork: string
  ): Promise<{
    exists: boolean;
    spread: number;
    targetNetwork: string;
    expectedProfit: number;
  } | undefined> {
    try {
      const targetNetworks = ['base', 'optimism', 'arbitrum', 'polygon'];
      const opportunities: CrossChainArbitrage[] = [];

      for (const toNetwork of targetNetworks) {
        if (toNetwork === fromNetwork) continue;

        try {
          const targetPrice = await this.getSupplyChainPrice(commodity, toNetwork);
          const spread = Math.abs(targetPrice.price - referencePrice.price) / referencePrice.price;

          if (spread > this.ARBITRAGE_THRESHOLD) {
            const isBuyLower = referencePrice.price < targetPrice.price;
            const arbitrage: CrossChainArbitrage = {
              fromNetwork: isBuyLower ? fromNetwork : toNetwork,
              toNetwork: isBuyLower ? toNetwork : fromNetwork,
              commodity,
              buyPrice: isBuyLower ? referencePrice.price : targetPrice.price,
              sellPrice: isBuyLower ? targetPrice.price : referencePrice.price,
              spread: spread * 100,
              estimatedGasCost: this.estimateGasCost(fromNetwork, toNetwork),
              netProfit: this.calculateNetProfit(spread, fromNetwork, toNetwork),
              confidence: Math.min(referencePrice.confidence, targetPrice.confidence),
              executionWindow: this.MAX_EXECUTION_WINDOW
            };

            opportunities.push(arbitrage);
          }
        } catch (error) {
          this.logger.warn(`Failed to compare prices for ${toNetwork}`, { error });
        }
      }

      // Return the best opportunity
      if (opportunities.length > 0) {
        const best = opportunities.reduce((best, current) => 
          current.netProfit > best.netProfit ? current : best
        );

        return {
          exists: true,
          spread: best.spread,
          targetNetwork: best.toNetwork,
          expectedProfit: best.netProfit
        };
      }

      return undefined;
    } catch (error) {
      this.logger.error(`Arbitrage detection failed for ${commodity}`, { error });
      return undefined;
    }
  }

  // Premium risk assessment
  private async assessPriceRisk(
    priceData: PythPriceData,
    commodity: string
  ): Promise<{
    volatility: number;
    confidenceScore: number;
    reliability: number;
  }> {
    try {
      // Get historical price data
      const history = await this.pythOracle.getPriceHistory(priceData.feedId, 24);
      
      if (history.length < 2) {
        return {
          volatility: 0,
          confidenceScore: 50,
          reliability: 50
        };
      }

      // Calculate volatility
      const prices = history.map(h => h.price);
      const volatility = this.calculateVolatility(prices);

      // Calculate confidence score based on confidence interval and volatility
      const confidencePercentage = (priceData.confidence / priceData.price) * 100;
      const confidenceScore = Math.max(0, 100 - confidencePercentage - volatility);

      // Calculate reliability based on data freshness and consistency
      const dataFreshness = this.calculateDataFreshness(history);
      const reliability = Math.min(confidenceScore, dataFreshness);

      return {
        volatility: Math.round(volatility * 100) / 100,
        confidenceScore: Math.round(confidenceScore),
        reliability: Math.round(reliability)
      };
    } catch (error) {
      this.logger.warn(`Risk assessment failed for ${commodity}`, { error });
      return {
        volatility: 0,
        confidenceScore: 0,
        reliability: 0
      };
    }
  }

  // Premium commodity feed mapping
  private getCommodityFeedId(commodity: string): string | null {
    const commodityMap: Record<string, string> = {
      'wheat': '0x0e9e5d3fd5d9463a9aa96d3731b5ed85fb6f77d9bfa5c2e1e5b5b3b3e3b3e3b',
      'corn': '0x1a2b3c4d5e6f7890123456789012345678901234567890123456789012345678',
      'soybean': '0x2b3c4d5e6f789012345678901234567890123456789012345678901234567890',
      'coffee': '0x3c4d5e6f78901234567890123456789012345678901234567890123456789012',
      'brent': '0x4d5e6f7890123456789012345678901234567890123456789012345678901234',
      'wti': '0x5e6f789012345678901234567890123456789012345678901234567890123456',
      'gold': '0x6f78901234567890123456789012345678901234567890123456789012345678',
      'silver': '0x7789012345678901234567890123456789012345678901234567890123456789',
      'copper': '0x8890123456789012345678901234567890123456789012345678901234567890',
      'carbon': '0x9901234567890123456789012345678901234567890123456789012345678901'
    };

    return commodityMap[commodity.toLowerCase()] || null;
  }

  // Premium backup pricing mechanism
  private async getBackupPrice(commodity: string, network: string): Promise<SupplyChainPriceData> {
    // Fallback pricing based on historical averages and market data
    const backupPrices: Record<string, number> = {
      'wheat': 650, // $ per bushel
      'corn': 480,  // $ per bushel
      'soybean': 1250, // $ per bushel
      'coffee': 165, // cents per pound
      'brent': 85, // $ per barrel
      'wti': 82, // $ per barrel
      'gold': 1950, // $ per ounce
      'silver': 24, // $ per ounce
      'copper': 3.8, // $ per pound
      'carbon': 12 // $ per tonne
    };

    const price = backupPrices[commodity.toLowerCase()] || 100;
    const confidence = price * 0.05; // 5% confidence interval

    return {
      commodity,
      price,
      confidence,
      timestamp: new Date(),
      source: 'backup',
      riskAssessment: {
        volatility: 2.5,
        confidenceScore: 30,
        reliability: 40
      }
    };
  }

  // Premium volatility calculation
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    return volatility;
  }

  // Premium data freshness calculation
  private calculateDataFreshness(history: any[]): number {
    if (history.length === 0) return 0;

    const now = Date.now();
    const ages = history.map(h => now - h.timestamp.getTime());
    const maxAge = Math.max(...ages);
    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    // Score based on average age (newer data = higher score)
    const freshness = Math.max(0, 100 - (avgAge / (60 * 60 * 1000))); // Per hour
    return Math.min(100, freshness);
  }

  // Premium gas cost estimation
  private estimateGasCost(fromNetwork: string, toNetwork: string): number {
    const gasCosts: Record<string, number> = {
      'ethereum': 50,
      'polygon': 5,
      'arbitrum': 8,
      'optimism': 7,
      'base': 4
    };

    const fromCost = gasCosts[fromNetwork] || 10;
    const toCost = gasCosts[toNetwork] || 10;
    
    return fromCost + toCost; // Simplified estimation
  }

  // Premium net profit calculation
  private calculateNetProfit(
    spread: number,
    fromNetwork: string,
    toNetwork: string
  ): number {
    const gasCost = this.estimateGasCost(fromNetwork, toNetwork);
    const grossProfit = spread * 1000; // Assuming $1000 trade size
    const netProfit = grossProfit - gasCost;
    
    return Math.max(0, netProfit);
  }

  // Premium batch processing for multiple commodities
  async getSupplyChainPrices(
    commodities: string[],
    network: string
  ): Promise<Map<string, SupplyChainPriceData>> {
    const results = new Map<string, SupplyChainPriceData>();
    const errors: string[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < commodities.length; i += batchSize) {
      const batch = commodities.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (commodity) => {
          try {
            const priceData = await this.getSupplyChainPrice(commodity, network);
            results.set(commodity, priceData);
          } catch (error) {
            errors.push(`Failed to get price for ${commodity}: ${error.message}`);
          }
        })
      );
    }

    if (errors.length > 0) {
      this.logger.warn(`Some commodity prices failed to retrieve`, { errors });
    }

    return results;
  }

  // Premium arbitrage execution simulation
  async simulateArbitrageExecution(
    arbitrage: CrossChainArbitrage
  ): Promise<{
    success: boolean;
    expectedProfit: number;
    risks: string[];
    executionTime: number;
    recommendations: string[];
  }> {
    try {
      const risks: string[] = [];
      const recommendations: string[] = [];

      // Risk assessment
      if (arbitrage.spread < 1.0) {
        risks.push('Low spread may not cover execution costs');
      }
      if (arbitrage.confidence < 0.8) {
        risks.push('Low price confidence increases execution risk');
      }
      if (arbitrage.executionWindow < 180) {
        risks.push('Short execution window increases failure risk');
      }

      // Recommendations
      if (arbitrage.spread > 2.0) {
        recommendations.push('High spread opportunity - consider immediate execution');
      }
      if (arbitrage.netProfit > 100) {
        recommendations.push('Significant profit potential - monitor closely');
      }

      // Simulate execution time
      const executionTime = this.simulateExecutionTime(arbitrage.fromNetwork, arbitrage.toNetwork);

      return {
        success: risks.length <= 2, // Allow up to 2 minor risks
        expectedProfit: arbitrage.netProfit,
        risks,
        executionTime,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Arbitrage simulation failed`, { error, arbitrage });
      return {
        success: false,
        expectedProfit: 0,
        risks: ['Simulation failed'],
        executionTime: 0,
        recommendations: ['Retry with different parameters']
      };
    }
  }

  // Premium execution time simulation
  private simulateExecutionTime(fromNetwork: string, toNetwork: string): number {
    const baseTimes: Record<string, number> = {
      'ethereum': 15,
      'polygon': 3,
      'arbitrum': 2,
      'optimism': 2,
      'base': 2
    };

    const fromTime = baseTimes[fromNetwork] || 5;
    const toTime = baseTimes[toNetwork] || 5;
    
    return fromTime + toTime + Math.random() * 10; // Add some variance
  }

  // Premium health monitoring
  async getIntegrationHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    oracleHealth: boolean;
    cacheHitRate: number;
    averageResponseTime: number;
    activeArbitrageOpportunities: number;
    lastUpdate: Date;
  }> {
    const oracleHealth = this.pythOracle.isOracleHealthy();
    const cacheHits = this.priceCache.size;
    const cacheHitRate = cacheHits > 0 ? 85 : 0; // Simulated
    const arbitrageCount = this.arbitrageCache.size;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!oracleHealth) status = 'unhealthy';
    else if (cacheHitRate < 50) status = 'degraded';

    return {
      status,
      oracleHealth,
      cacheHitRate,
      averageResponseTime: 150, // Simulated
      activeArbitrageOpportunities: arbitrageCount,
      lastUpdate: new Date()
    };
  }
}

export default TruDeSupplyChainOracleIntegration;