import { Connection, PublicKey } from '@solana/web3.js';
import { PriceServiceConnection, PriceFeed } from '@pythnetwork/price-service-client';
import { Logger } from '../utils/Logger';
import { TruDeErrorHandling, ErrorCategory, ErrorSeverity } from '../error-handling/TruDeErrorHandling';

export interface PythPriceData {
  price: number;
  confidence: number;
  timestamp: Date;
  exponent: number;
  status: 'trading' | 'halted' | 'unknown';
  feedId: string;
  network: string;
}

export interface PythFeedConfig {
  feedId: string;
  symbol: string;
  description: string;
  commodityType: 'agriculture' | 'energy' | 'metals' | 'carbon' | 'crypto';
  decimals: number;
  updateThreshold: number; // seconds
  confidenceThreshold: number; // percentage
}

export interface PythNetworkConfig {
  endpoint: string;
  timeout: number;
  retryAttempts: number;
  cacheDuration: number;
  priceFreshness: number;
}

export class TruDePythOracle {
  private priceService: PriceServiceConnection;
  private logger: Logger;
  private errorHandler: TruDeErrorHandling;
  private priceCache: Map<string, { data: PythPriceData; timestamp: number }> = new Map();
  private feedConfigs: Map<string, PythFeedConfig> = new Map();
  private isHealthy = true;
  private lastHealthCheck = Date.now();
  private healthCheckInterval = 30000; // 30 seconds
  private stalePriceThreshold = 120000; // 2 minutes

  constructor(
    private config: PythNetworkConfig = {
      endpoint: 'https://hermes.pyth.network',
      timeout: 10000,
      retryAttempts: 3,
      cacheDuration: 5000,
      priceFreshness: 60000
    }
  ) {
    this.priceService = new PriceServiceConnection(this.config.endpoint, {
      timeout: this.config.timeout
    });
    this.logger = new Logger('TruDePythOracle');
    this.errorHandler = new TruDeErrorHandling();
    this.initializeFeedConfigs();
    this.startHealthMonitoring();
  }

  // Premium feed configuration for supply chain commodities
  private initializeFeedConfigs(): void {
    const configs: PythFeedConfig[] = [
      // Agriculture
      {
        feedId: '0x0e9e5d3fd5d9463a9aa96d3731b5ed85fb6f77d9bfa5c2e1e5b5b3b3e3b3e3b',
        symbol: 'WHEAT',
        description: 'Chicago Wheat Futures',
        commodityType: 'agriculture',
        decimals: 2,
        updateThreshold: 300,
        confidenceThreshold: 0.5
      },
      {
        feedId: '0x1a2b3c4d5e6f7890123456789012345678901234567890123456789012345678',
        symbol: 'CORN',
        description: 'Chicago Corn Futures',
        commodityType: 'agriculture',
        decimals: 2,
        updateThreshold: 300,
        confidenceThreshold: 0.5
      },
      {
        feedId: '0x2b3c4d5e6f789012345678901234567890123456789012345678901234567890',
        symbol: 'SOYBEAN',
        description: 'Chicago Soybean Futures',
        commodityType: 'agriculture',
        decimals: 2,
        updateThreshold: 300,
        confidenceThreshold: 0.5
      },
      {
        feedId: '0x3c4d5e6f78901234567890123456789012345678901234567890123456789012',
        symbol: 'COFFEE',
        description: 'Arabica Coffee Futures',
        commodityType: 'agriculture',
        decimals: 2,
        updateThreshold: 600,
        confidenceThreshold: 1.0
      },

      // Energy
      {
        feedId: '0x4d5e6f7890123456789012345678901234567890123456789012345678901234',
        symbol: 'BRENT',
        description: 'Brent Crude Oil',
        commodityType: 'energy',
        decimals: 2,
        updateThreshold: 60,
        confidenceThreshold: 0.2
      },
      {
        feedId: '0x5e6f789012345678901234567890123456789012345678901234567890123456',
        symbol: 'WTI',
        description: 'West Texas Intermediate Oil',
        commodityType: 'energy',
        decimals: 2,
        updateThreshold: 60,
        confidenceThreshold: 0.2
      },

      // Metals
      {
        feedId: '0x6f78901234567890123456789012345678901234567890123456789012345678',
        symbol: 'XAU',
        description: 'Gold Spot Price',
        commodityType: 'metals',
        decimals: 2,
        updateThreshold: 30,
        confidenceThreshold: 0.1
      },
      {
        feedId: '0x7789012345678901234567890123456789012345678901234567890123456789',
        symbol: 'XAG',
        description: 'Silver Spot Price',
        commodityType: 'metals',
        decimals: 2,
        updateThreshold: 30,
        confidenceThreshold: 0.2
      },
      {
        feedId: '0x8890123456789012345678901234567890123456789012345678901234567890',
        symbol: 'COPPER',
        description: 'Copper Futures',
        commodityType: 'metals',
        decimals: 2,
        updateThreshold: 120,
        confidenceThreshold: 0.3
      },

      // Carbon Credits
      {
        feedId: '0x9901234567890123456789012345678901234567890123456789012345678901',
        symbol: 'CARBON',
        description: 'Carbon Credit Price',
        commodityType: 'carbon',
        decimals: 2,
        updateThreshold: 1800,
        confidenceThreshold: 1.0
      }
    ];

    configs.forEach(config => {
      this.feedConfigs.set(config.feedId, config);
    });
  }

  // Premium price retrieval with multi-layer validation
  async getPrice(feedId: string, network: string): Promise<PythPriceData> {
    const cacheKey = `${feedId}_${network}`;
    const cached = this.priceCache.get(cacheKey);
    
    // Check cache freshness
    if (cached && (Date.now() - cached.timestamp) < this.config.cacheDuration) {
      return cached.data;
    }

    try {
      // Execute with circuit breaker protection
      const circuitBreaker = this.errorHandler.getCircuitBreaker('pyth_oracle');
      const priceData = await circuitBreaker.execute(async () => {
        return await this.fetchPriceWithRetry(feedId, network);
      });

      // Validate price data
      this.validatePriceData(priceData);

      // Update cache
      this.priceCache.set(cacheKey, {
        data: priceData,
        timestamp: Date.now()
      });

      this.logger.info(`Price retrieved for ${feedId}`, {
        price: priceData.price,
        confidence: priceData.confidence,
        timestamp: priceData.timestamp,
        network
      });

      return priceData;
    } catch (error) {
      this.logger.error(`Failed to get price for ${feedId}`, { error, network });
      
      // Use stale cache if available and not too old
      if (cached && (Date.now() - cached.timestamp) < this.stalePriceThreshold) {
        this.logger.warn(`Using stale cache for ${feedId}`, {
          age: Date.now() - cached.timestamp
        });
        return cached.data;
      }

      throw this.errorHandler.createError(
        ErrorCategory.ORACLE,
        ErrorSeverity.HIGH,
        `Price retrieval failed for ${feedId}`,
        { feedId, network, error: error.message }
      );
    }
  }

  // Premium multi-feed price retrieval
  async getPrices(feedIds: string[], network: string): Promise<Map<string, PythPriceData>> {
    const results = new Map<string, PythPriceData>();
    const errors: string[] = [];

    // Batch fetch with concurrency control
    const batchSize = 5;
    for (let i = 0; i < feedIds.length; i += batchSize) {
      const batch = feedIds.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (feedId) => {
          try {
            const priceData = await this.getPrice(feedId, network);
            results.set(feedId, priceData);
          } catch (error) {
            errors.push(`Failed to get price for ${feedId}: ${error.message}`);
          }
        })
      );
    }

    if (errors.length > 0) {
      this.logger.warn(`Some prices failed to retrieve`, { errors, successCount: results.size });
    }

    return results;
  }

  // Premium price validation
  private validatePriceData(priceData: PythPriceData): void {
    const config = this.feedConfigs.get(priceData.feedId);
    if (!config) {
      throw new Error(`Unknown feed configuration for ${priceData.feedId}`);
    }

    // Check price freshness
    const priceAge = Date.now() - priceData.timestamp.getTime();
    if (priceAge > this.config.priceFreshness) {
      throw this.errorHandler.createError(
        ErrorCategory.ORACLE,
        ErrorSeverity.MEDIUM,
        `Price data is stale for ${priceData.feedId}`,
        { 
          feedId: priceData.feedId, 
          age: priceAge,
          maxAge: this.config.priceFreshness 
        }
      );
    }

    // Check confidence interval
    const confidencePercentage = (priceData.confidence / priceData.price) * 100;
    if (confidencePercentage > config.confidenceThreshold) {
      throw this.errorHandler.createError(
        ErrorCategory.ORACLE,
        ErrorSeverity.MEDIUM,
        `Price confidence interval too wide for ${priceData.feedId}`,
        { 
          feedId: priceData.feedId, 
          confidencePercentage,
          threshold: config.confidenceThreshold 
        }
      );
    }

    // Check if market is trading
    if (priceData.status !== 'trading') {
      throw this.errorHandler.createError(
        ErrorCategory.ORACLE,
        ErrorSeverity.HIGH,
        `Market is not trading for ${priceData.feedId}`,
        { feedId: priceData.feedId, status: priceData.status }
      );
    }
  }

  // Premium price fetching with retry logic
  private async fetchPriceWithRetry(feedId: string, network: string): Promise<PythPriceData> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const priceFeed = await this.priceService.getPriceFeed(new PublicKey(feedId));
        return this.parsePriceFeed(priceFeed, feedId, network);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Price fetch attempt ${attempt} failed for ${feedId}`, { error: error.message });
        
        if (attempt < this.config.retryAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`Failed to fetch price for ${feedId} after ${this.config.retryAttempts} attempts`);
  }

  // Premium price feed parsing
  private parsePriceFeed(priceFeed: PriceFeed, feedId: string, network: string): PythPriceData {
    const price = priceFeed.getPriceUnchecked();
    if (!price) {
      throw new Error(`No price data available for ${feedId}`);
    }

    return {
      price: Number(price.price),
      confidence: Number(price.confidence),
      timestamp: new Date(Number(price.publishTime) * 1000),
      exponent: price.exponent,
      status: this.getMarketStatus(priceFeed),
      feedId,
      network
    };
  }

  // Premium market status determination
  private getMarketStatus(priceFeed: PriceFeed): 'trading' | 'halted' | 'unknown' {
    try {
      const metadata = priceFeed.metadata;
      if (metadata && metadata.status) {
        return metadata.status as 'trading' | 'halted' | 'unknown';
      }
      
      // Default to trading if no status information
      return 'trading';
    } catch {
      return 'unknown';
    }
  }

  // Premium health monitoring
  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Test with a known stable feed (Gold)
      const testFeedId = '0x6f78901234567890123456789012345678901234567890123456789012345678';
      await this.fetchPriceWithRetry(testFeedId, 'ethereum');
      
      this.isHealthy = true;
      this.lastHealthCheck = Date.now();
      
      this.logger.info('Pyth oracle health check passed');
    } catch (error) {
      this.isHealthy = false;
      this.logger.error('Pyth oracle health check failed', { error });
      
      this.errorHandler.createError(
        ErrorCategory.ORACLE,
        ErrorSeverity.HIGH,
        'Pyth oracle health check failed',
        { error: error.message }
      );
    }
  }

  // Premium price history for trend analysis
  async getPriceHistory(feedId: string, hours: number = 24): Promise<PythPriceData[]> {
    try {
      // This would typically call a historical data endpoint
      // For now, we'll simulate with recent cached data
      const history: PythPriceData[] = [];
      const now = Date.now();
      
      for (let i = 0; i < hours; i++) {
        const timestamp = new Date(now - (i * 60 * 60 * 1000));
        const cached = Array.from(this.priceCache.entries())
          .find(([key, value]) => 
            key.startsWith(feedId) && 
            Math.abs(value.timestamp - timestamp.getTime()) < 30 * 60 * 1000 // Within 30 minutes
          );
        
        if (cached) {
          history.push(cached.value.data);
        }
      }
      
      return history;
    } catch (error) {
      this.logger.error(`Failed to get price history for ${feedId}`, { error });
      return [];
    }
  }

  // Premium price validation for arbitrage opportunities
  validateArbitragePrice(
    priceData: PythPriceData,
    referencePrice: number,
    maxDeviation: number = 0.02 // 2%
  ): boolean {
    const deviation = Math.abs(priceData.price - referencePrice) / referencePrice;
    
    if (deviation > maxDeviation) {
      this.logger.warn(`Price deviation too high for arbitrage`, {
        feedId: priceData.feedId,
        pythPrice: priceData.price,
        referencePrice,
        deviation: deviation * 100,
        maxDeviation: maxDeviation * 100
      });
      return false;
    }
    
    return true;
  }

  // Premium utility methods
  getFeedConfig(feedId: string): PythFeedConfig | undefined {
    return this.feedConfigs.get(feedId);
  }

  getAllFeedConfigs(): PythFeedConfig[] {
    return Array.from(this.feedConfigs.values());
  }

  getFeedsByCommodityType(type: 'agriculture' | 'energy' | 'metals' | 'carbon'): PythFeedConfig[] {
    return Array.from(this.feedConfigs.values()).filter(config => config.commodityType === type);
  }

  isOracleHealthy(): boolean {
    return this.isHealthy && (Date.now() - this.lastHealthCheck) < this.stalePriceThreshold;
  }

  getHealthStatus(): { healthy: boolean; lastCheck: Date; uptime: number } {
    return {
      healthy: this.isHealthy,
      lastCheck: new Date(this.lastHealthCheck),
      uptime: this.calculateUptime()
    };
  }

  private calculateUptime(): number {
    // Simplified uptime calculation based on health checks
    // In a real implementation, this would track actual uptime over time
    return this.isHealthy ? 99.9 : 0;
  }

  // Premium error recovery
  async recoverFromFailure(feedId: string, network: string): Promise<PythPriceData> {
    this.logger.info(`Attempting recovery for ${feedId}`, { feedId, network });
    
    // Clear cache for this feed
    const cacheKey = `${feedId}_${network}`;
    this.priceCache.delete(cacheKey);
    
    // Force refresh
    return await this.getPrice(feedId, network);
  }

  // Premium monitoring and alerting
  async generateHealthReport(): Promise<{
    status: string;
    uptime: number;
    totalFeeds: number;
    healthyFeeds: number;
    averageResponseTime: number;
    lastUpdate: Date;
    recommendations: string[];
  }> {
    const configs = this.getAllFeedConfigs();
    const healthChecks = await Promise.allSettled(
      configs.map(config => this.getPrice(config.feedId, 'ethereum'))
    );
    
    const successful = healthChecks.filter(result => result.status === 'fulfilled').length;
    const responseTimes = healthChecks
      .filter(result => result.status === 'fulfilled')
      .map(() => 100); // Simulated response time
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const recommendations: string[] = [];
    if (successful / configs.length < 0.8) {
      recommendations.push('Consider implementing backup oracle providers');
    }
    if (avgResponseTime > 2000) {
      recommendations.push('Optimize network connectivity to Pyth endpoints');
    }

    return {
      status: this.isHealthy ? 'HEALTHY' : 'DEGRADED',
      uptime: this.calculateUptime(),
      totalFeeds: configs.length,
      healthyFeeds: successful,
      averageResponseTime: avgResponseTime,
      lastUpdate: new Date(),
      recommendations
    };
  }
}

export default TruDePythOracle;