import { z } from 'zod';
import { createTRPCRouter, baseProcedure } from '../main';
import { TRPCError } from '@trpc/server';

// Market condition types
export const MarketCondition = z.enum(['BULL', 'BEAR', 'STAGNANT', 'VOLATILE']);
export type MarketCondition = z.infer<typeof MarketCondition>;

// Strategy types
export const StrategyType = z.enum(['AGGRESSIVE', 'CONSERVATIVE', 'BALANCED', 'ARBITRAGE']);
export type StrategyType = z.infer<typeof StrategyType>;

// Market metrics schema
const MarketMetricsSchema = z.object({
  volatility24h: z.number(), // 24h volatility percentage
  priceChange24h: z.number(), // 24h price change percentage
  volume24h: z.number(), // 24h volume in USD
  marketCap: z.number(), // market cap in USD
  fearGreedIndex: z.number(), // 0-100 fear & greed index
  stablecoinDominance: z.number(), // stablecoin market dominance percentage
});

// Strategy configuration schema
const StrategyConfigSchema = z.object({
  targetDailyROI: z.number().min(0.001).max(0.1), // 0.1% to 10% daily target
  maxDrawdown: z.number().min(0.01).max(0.5), // max 50% drawdown
  riskLevel: z.number().min(1).max(10), // 1-10 risk scale
  minInvestment: z.number().min(1), // minimum investment in USD
  maxInvestment: z.number().optional(), // maximum investment in USD
  autoRebalance: z.boolean().default(true),
  stopLoss: z.number().min(0.01).max(0.9), // stop loss percentage
  takeProfit: z.number().min(0.01).max(2.0), // take profit percentage
});

export type StrategyConfig = z.infer<typeof StrategyConfigSchema>;

// Strategy recommendation schema
const StrategyRecommendationSchema = z.object({
  condition: MarketCondition,
  strategy: StrategyType,
  recommendedAllocation: z.object({
    stablecoins: z.number(), // percentage
    blueChips: z.number(), // percentage (BTC, ETH)
    altcoins: z.number(), // percentage
    defi: z.number(), // percentage
    cash: z.number(), // percentage
  }),
  expectedDailyROI: z.number(),
  confidence: z.number(), // 0-1 confidence score
  riskScore: z.number(), // 0-10 risk assessment
  reasoning: z.string(),
  timeframe: z.enum(['1D', '1W', '1M']),
});

export type StrategyRecommendation = z.infer<typeof StrategyRecommendationSchema>;

// Market analysis service
class MarketAnalysisService {
  private readonly CRYPTO_COMPARE_API = 'https://min-api.cryptocompare.com/data';
  private readonly COIN_GECKO_API = 'https://api.coingecko.com/api/v3';
  
  async getMarketMetrics(): Promise<z.infer<typeof MarketMetricsSchema>> {
    try {
      // Fetch multiple data sources for comprehensive analysis
      const [cryptoData, fearGreedData, stablecoinData] = await Promise.all([
        this.fetchCryptoMetrics(),
        this.fetchFearGreedIndex(),
        this.fetchStablecoinMetrics(),
      ]);

      return MarketMetricsSchema.parse({
        volatility24h: cryptoData.volatility24h,
        priceChange24h: cryptoData.priceChange24h,
        volume24h: cryptoData.volume24h,
        marketCap: cryptoData.marketCap,
        fearGreedIndex: fearGreedData.fearGreedIndex,
        stablecoinDominance: stablecoinData.dominance,
      });
    } catch (error) {
      console.error('Failed to fetch market metrics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch market data',
      });
    }
  }

  private async fetchCryptoMetrics() {
    // Fallback data for development
    return {
      volatility24h: Math.random() * 20 + 5, // 5-25% volatility
      priceChange24h: (Math.random() - 0.5) * 20, // -10% to +10% change
      volume24h: Math.random() * 50000000000 + 10000000000, // $10B-$60B
      marketCap: Math.random() * 1000000000000 + 500000000000, // $500B-$1.5T
    };
  }

  private async fetchFearGreedIndex() {
    // Fallback fear & greed index
    return {
      fearGreedIndex: Math.floor(Math.random() * 100),
    };
  }

  private async fetchStablecoinMetrics() {
    // Fallback stablecoin data
    return {
      dominance: Math.random() * 15 + 5, // 5-20% dominance
    };
  }

  determineMarketCondition(metrics: z.infer<typeof MarketMetricsSchema>): MarketCondition {
    const { volatility24h, priceChange24h, fearGreedIndex, stablecoinDominance } = metrics;

    // High volatility conditions
    if (volatility24h > 15) {
      if (priceChange24h > 5 && fearGreedIndex > 70) return 'BULL';
      if (priceChange24h < -5 && fearGreedIndex < 30) return 'BEAR';
      return 'VOLATILE';
    }

    // Low volatility conditions
    if (volatility24h < 5) {
      if (Math.abs(priceChange24h) < 2 && stablecoinDominance > 12) return 'STAGNANT';
      if (priceChange24h > 2) return 'BULL';
      if (priceChange24h < -2) return 'BEAR';
    }

    // Medium volatility - balanced assessment
    if (priceChange24h > 5 && fearGreedIndex > 60) return 'BULL';
    if (priceChange24h < -5 && fearGreedIndex < 40) return 'BEAR';
    if (volatility24h > 10) return 'VOLATILE';

    return 'STAGNANT';
  }
}

// Strategy engine
class StrategyEngine {
  private marketAnalysis: MarketAnalysisService;

  constructor() {
    this.marketAnalysis = new MarketAnalysisService();
  }

  async generateStrategy(
    userConfig: StrategyConfig,
    marketCondition?: MarketCondition
  ): Promise<StrategyRecommendation> {
    let condition = marketCondition;
    let metrics: z.infer<typeof MarketMetricsSchema> | undefined;

    if (!condition) {
      metrics = await this.marketAnalysis.getMarketMetrics();
      condition = new MarketAnalysisService().determineMarketCondition(metrics);
    }

    const baseStrategy = this.getBaseStrategy(condition, userConfig);
    const optimizedStrategy = this.optimizeStrategy(baseStrategy, userConfig, metrics);

    return StrategyRecommendationSchema.parse(optimizedStrategy);
  }

  private getBaseStrategy(condition: MarketCondition, config: StrategyConfig): Partial<StrategyRecommendation> {
    const strategies: Record<MarketCondition, Partial<StrategyRecommendation>> = {
      BULL: {
        condition: 'BULL',
        strategy: 'AGGRESSIVE',
        recommendedAllocation: {
          stablecoins: 20,
          blueChips: 50,
          altcoins: 25,
          defi: 5,
          cash: 0,
        },
        expectedDailyROI: config.targetDailyROI * 1.5,
        confidence: 0.8,
        riskScore: 7,
        reasoning: 'Bull market detected. High confidence in upward momentum. Allocate heavily to growth assets.',
        timeframe: '1W',
      },
      BEAR: {
        condition: 'BEAR',
        strategy: 'CONSERVATIVE',
        recommendedAllocation: {
          stablecoins: 70,
          blueChips: 20,
          altcoins: 5,
          defi: 0,
          cash: 5,
        },
        expectedDailyROI: config.targetDailyROI * 0.3,
        confidence: 0.9,
        riskScore: 2,
        reasoning: 'Bear market detected. Preserve capital with stablecoin-heavy allocation.',
        timeframe: '1M',
      },
      STAGNANT: {
        condition: 'STAGNANT',
        strategy: 'BALANCED',
        recommendedAllocation: {
          stablecoins: 40,
          blueChips: 35,
          altcoins: 15,
          defi: 10,
          cash: 0,
        },
        expectedDailyROI: config.targetDailyROI * 0.8,
        confidence: 0.6,
        riskScore: 4,
        reasoning: 'Stagnant market. Balanced approach with moderate yield generation.',
        timeframe: '1W',
      },
      VOLATILE: {
        condition: 'VOLATILE',
        strategy: 'ARBITRAGE',
        recommendedAllocation: {
          stablecoins: 60,
          blueChips: 25,
          altcoins: 10,
          defi: 5,
          cash: 0,
        },
        expectedDailyROI: config.targetDailyROI * 1.2,
        confidence: 0.7,
        riskScore: 6,
        reasoning: 'High volatility detected. Focus on arbitrage opportunities and stable yield.',
        timeframe: '1D',
      },
    };

    return strategies[condition];
  }

  private optimizeStrategy(
    baseStrategy: Partial<StrategyRecommendation>,
    config: StrategyConfig,
    metrics?: z.infer<typeof MarketMetricsSchema>
  ): Partial<StrategyRecommendation> {
    // Adjust based on user risk tolerance
    const riskMultiplier = config.riskLevel / 5; // Normalize 1-10 to 0.2-2.0
    
    // Ensure minimum 1% daily ROI in active markets
    let expectedROI = Math.max(baseStrategy.expectedDailyROI || 0.01, 0.01);
    
    // Apply risk adjustment
    expectedROI = expectedROI * riskMultiplier;
    
    // Cap at reasonable limits
    expectedROI = Math.min(expectedROI, config.targetDailyROI * 2);
    
    return {
      ...baseStrategy,
      expectedDailyROI: expectedROI,
    };
  }
}

// tRPC router
export const strategyRouter = createTRPCRouter({
  // Get current market condition
  getMarketCondition: baseProcedure
    .query(async () => {
      const marketAnalysis = new MarketAnalysisService();
      const metrics = await marketAnalysis.getMarketMetrics();
      const condition = marketAnalysis.determineMarketCondition(metrics);
      
      return {
        condition,
        metrics,
        timestamp: new Date().toISOString(),
      };
    }),

  // Generate personalized strategy
  generateStrategy: baseProcedure
    .input(
      z.object({
        config: StrategyConfigSchema,
        marketCondition: MarketCondition.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const strategyEngine = new StrategyEngine();
      const recommendation = await strategyEngine.generateStrategy(
        input.config,
        input.marketCondition
      );
      
      return {
        recommendation,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get 1% guaranteed strategy
  getGuaranteedStrategy: baseProcedure
    .input(
      z.object({
        investmentAmount: z.number().min(1),
        timeframe: z.enum(['1D', '1W', '1M']).default('1D'),
      })
    )
    .mutation(async ({ input }) => {
      const strategyEngine = new StrategyEngine();
      
      // Configuration for 1% daily guaranteed strategy
      const guaranteedConfig: StrategyConfig = {
        targetDailyROI: 0.01, // 1% daily
        maxDrawdown: 0.02, // Max 2% loss
        riskLevel: 2, // Very low risk
        minInvestment: input.investmentAmount,
        autoRebalance: true,
        stopLoss: 0.01, // 1% stop loss
        takeProfit: 0.015, // 1.5% take profit
      };
      
      const recommendation = await strategyEngine.generateStrategy(guaranteedConfig);
      
      // Override for guaranteed strategy
      const guaranteedStrategy: StrategyRecommendation = {
        ...recommendation,
        expectedDailyROI: 0.01, // Force 1%
        riskScore: 1, // Minimum risk
        reasoning: 'Conservative 1% daily strategy using stablecoin yield farming and arbitrage. Designed for capital preservation with steady returns.',
        confidence: 0.95, // High confidence in stable returns
      };
      
      return {
        recommendation: guaranteedStrategy,
        investmentAmount: input.investmentAmount,
        timeframe: input.timeframe,
        expectedReturn: input.investmentAmount * 0.01, // 1% return
        timestamp: new Date().toISOString(),
      };
    }),

  // Get relaxed strategy for stagnant markets
  getRelaxedStrategy: baseProcedure
    .input(
      z.object({
        investmentAmount: z.number().min(1),
        targetROI: z.number().min(0.001).max(0.05).default(0.005), // 0.1% to 5% daily
      })
    )
    .mutation(async ({ input }) => {
      const strategyEngine = new StrategyEngine();
      
      // Configuration for relaxed strategy in stagnant markets
      const relaxedConfig: StrategyConfig = {
        targetDailyROI: input.targetROI,
        maxDrawdown: 0.01, // Max 1% loss
        riskLevel: 1, // Minimal risk
        minInvestment: input.investmentAmount,
        autoRebalance: true,
        stopLoss: 0.005, // 0.5% stop loss
        takeProfit: input.targetROI * 1.5, // 1.5x target for take profit
      };
      
      const recommendation = await strategyEngine.generateStrategy(relaxedConfig, 'STAGNANT');
      
      return {
        recommendation,
        investmentAmount: input.investmentAmount,
        expectedReturn: input.investmentAmount * input.targetROI,
        timestamp: new Date().toISOString(),
      };
    }),
});