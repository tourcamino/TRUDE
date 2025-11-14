import { AIBulletproofEngine } from './ai-engine';
import { AIMonitoringService } from './ai-monitoring';
import { getPreferredExecutionNetworks, isL2Network, getMinProfitUSDForNetwork } from '../config/networks';
import { z } from 'zod';

// Schemi di validazione per operazioni finanziarie
const ExecutionOrderSchema = z.object({
  type: z.enum(['BUY', 'SELL', 'SWAP', 'STAKE', 'UNSTAKE', 'BRIDGE']),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amount: z.string(),
  maxSlippage: z.number().min(0.01).max(5),
  maxFee: z.number().min(0.01).max(10),
  targetProfit: z.number().min(0.1).max(50),
  stopLoss: z.number().min(0.1).max(20),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  chainId: z.number(),
  walletAddress: z.string().optional()
});

const MarketAnalysisSchema = z.object({
  tokenAddress: z.string(),
  chainId: z.number(),
  timeframe: z.string(),
  indicators: z.array(z.string()).optional()
});

// Interface per Dune API
interface DuneAnalytics {
  query(queryId: number, parameters?: Record<string, any>): Promise<any>;
  getLatestResults(queryId: number): Promise<any>;
}

// Interface per Moralis API
interface MoralisWeb3 {
  getTokenPrice(params: { address: string; chain: string }): Promise<any>;
  getWalletTransactions(params: { address: string; chain: string }): Promise<any>;
  getTokenMetadata(params: { addresses: string[]; chain: string }): Promise<any>;
  getPairReserves(params: { pairAddress: string; chain: string }): Promise<any>;
  getBlockStats(params: { chain: string }): Promise<any>;
}

export class AIExecutionEngine {
  private aiEngine: AIBulletproofEngine;
  private monitoring: AIMonitoringService;
  private duneClient: DuneAnalytics;
  private moralisClient: MoralisWeb3;
  private executionHistory: Map<string, any> = new Map();
  private priceCache = new Map<string, { price: number; expires: number }>();

  constructor(
    duneApiKey?: string,
    moralisApiKey?: string
  ) {
    this.aiEngine = new AIBulletproofEngine();
    this.monitoring = new AIMonitoringService();
    
    // Use provided keys or fall back to environment variables
    const finalDuneKey = duneApiKey || process.env.DUNE_API_KEY || '';
    const finalMoralisKey = moralisApiKey || process.env.MORALIS_API_KEY || '';
    
    if (!finalDuneKey) {
      console.warn('DUNE_API_KEY not configured - Dune analytics will be limited');
    }
    if (!finalMoralisKey) {
      console.warn('MORALIS_API_KEY not configured - Real-time data will be limited');
    }
    
    this.duneClient = this.createDuneClient(finalDuneKey);
    this.moralisClient = this.createMoralisClient(finalMoralisKey);
  }

  private createDuneClient(apiKey: string): DuneAnalytics {
    return {
      async query(queryId: number, parameters?: Record<string, any>) {
        const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/execute`, {
          method: 'POST',
          headers: {
            'X-Dune-API-Key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query_parameters: parameters })
        });
        return response.json();
      },
      async getLatestResults(queryId: number) {
        const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results`, {
          headers: { 'X-Dune-API-Key': apiKey }
        });
        return response.json();
      }
    };
  }

  private createMoralisClient(apiKey: string): MoralisWeb3 {
    const baseUrl = 'https://deep-index.moralis.io/api/v2';
    
    return {
      async getTokenPrice(params: { address: string; chain: string }) {
        const response = await fetch(
          `${baseUrl}/erc20/${params.address}/price?chain=${params.chain}`,
          { headers: { 'X-API-Key': apiKey } }
        );
        return response.json();
      },
      
      async getWalletTransactions(params: { address: string; chain: string }) {
        const response = await fetch(
          `${baseUrl}/${params.address}?chain=${params.chain}`,
          { headers: { 'X-API-Key': apiKey } }
        );
        return response.json();
      },
      
      async getTokenMetadata(params: { addresses: string[]; chain: string }) {
        const response = await fetch(
          `${baseUrl}/erc20/metadata?chain=${params.chain}&addresses=${params.addresses.join(',')}`,
          { headers: { 'X-API-Key': apiKey } }
        );
        return response.json();
      },
      
      async getPairReserves(params: { pairAddress: string; chain: string }) {
        const response = await fetch(
          `${baseUrl}/${params.pairAddress}/reserves?chain=${params.chain}`,
          { headers: { 'X-API-Key': apiKey } }
        );
        return response.json();
      },
      
      async getBlockStats(params: { chain: string }) {
        const response = await fetch(
          `${baseUrl}/block/${params.chain}/stats`,
          { headers: { 'X-API-Key': apiKey } }
        );
        return response.json();
      }
    };
  }

  async analyzeMarketConditions(order: z.infer<typeof ExecutionOrderSchema>) {
    const startTime = Date.now();
    
    try {
      const [duneData, moralisData] = await Promise.all([
        this.getOnChainAnalytics(order),
        this.getRealTimeData(order)
      ]);

      // Analyze sentiment with comprehensive data
      const sentiment = await this.analyzeMarketSentiment(order, duneData, moralisData);

      const analysisResponse = await this.aiEngine.generateTextWithFallback(
        this.buildMarketAnalysisPrompt(order, duneData, moralisData, sentiment),
        { temperature: 0.2, cacheTTLMs: 5 * 60 * 1000 }
      );

      const result = {
        success: true,
        analysis: JSON.parse(String(analysisResponse.data || '')),
        dataSources: { dune: duneData, moralis: moralisData, sentiment }
      };

      // Record metric
      this.monitoring.recordMetric({
        id: `market_analysis-${Date.now()}`,
        provider: 'openrouter',
        operation: 'market_analysis',
        success: true,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date()
      });

      return result;
      
    } catch (error) {
      this.monitoring.recordMetric({
        id: `market_analysis-${Date.now()}`,
        provider: 'openrouter',
        operation: 'market_analysis',
        success: false,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date(),
        error: (error as any)?.message || String(error)
      });
      throw error;
    }
  }

  private async getOnChainAnalytics(order: any) {
    try {
      // Advanced Dune Analytics queries for TRUDE optimization
      const queries = await Promise.allSettled([
        // Whale activity analysis
        this.duneClient.query(1259318, { 
          token_address: order.tokenIn,
          timeframe: order.timeframe,
          chain_id: order.chainId
        }),
        
        // Liquidity pool analysis
        this.duneClient.query(1259320, {
          token0: order.tokenIn,
          token1: order.tokenOut,
          chain: this.getChainName(order.chainId)
        }),
        
        // Gas optimization analysis
        this.duneClient.query(1259322, {
          chain_id: order.chainId,
          timeframe: order.timeframe
        }),
        
        // MEV activity monitoring
        this.duneClient.query(1259324, {
          token_address: order.tokenIn,
          chain_id: order.chainId
        }),
        
        // Cross-chain bridge efficiency
        this.duneClient.query(1259326, {
          source_chain: order.chainId,
          target_chain: order.targetChainId || 1
        })
      ]);

      const [whaleActivity, liquidityAnalysis, gasAnalysis, mevAnalysis, bridgeAnalysis] = queries;

      return {
        whaleActivity: whaleActivity.status === 'fulfilled' ? whaleActivity.value.result?.rows || [] : [],
        liquidity: liquidityAnalysis.status === 'fulfilled' ? liquidityAnalysis.value.result?.rows || [] : [],
        gasOptimization: gasAnalysis.status === 'fulfilled' ? gasAnalysis.value.result?.rows || [] : [],
        mevActivity: mevAnalysis.status === 'fulfilled' ? mevAnalysis.value.result?.rows || [] : [],
        bridgeEfficiency: bridgeAnalysis.status === 'fulfilled' ? bridgeAnalysis.value.result?.rows || [] : [],
        timestamp: Date.now(),
        dataQuality: {
          whale: whaleActivity.status,
          liquidity: liquidityAnalysis.status,
          gas: gasAnalysis.status,
          mev: mevAnalysis.status,
          bridge: bridgeAnalysis.status
        }
      };
    } catch (error) {
      console.warn('Dune API error:', error);
      return { 
        error: 'Dune data unavailable',
        whaleActivity: [],
        liquidity: [],
        gasOptimization: [],
        mevActivity: [],
        bridgeEfficiency: [],
        timestamp: Date.now(),
        dataQuality: { error: 'all_failed' }
      };
    }
  }

  private async getRealTimeData(order: any) {
    try {
      const chain = this.getChainName(order.chainId);
      const chainId = order.chainId;
      
      // Advanced Moralis Web3 API calls for comprehensive market analysis
      const apiCalls = await Promise.allSettled([
        // Token price and market data
        this.moralisClient.getTokenPrice({ 
          address: order.tokenIn, 
          chain 
        }),
        
        // Token metadata and contract analysis
        this.moralisClient.getTokenMetadata({ 
          addresses: [order.tokenIn, order.tokenOut], 
          chain 
        }),
        
        // Block statistics and network health
        this.moralisClient.getBlockStats({ chain }),
        
        // Recent wallet transactions for momentum analysis
        this.moralisClient.getWalletTransactions({ 
          address: '0x0000000000000000000000000000000000000000', // Zero address for network activity
          chain 
        }),
        
        // Pair reserves analysis for liquidity assessment
        this.moralisClient.getPairReserves({ 
          pairAddress: this.derivePairAddress(order.tokenIn, order.tokenOut, chainId), 
          chain 
        }),
        
        // Token transfers for volume analysis
        this.getTokenTransfers(order.tokenIn, chain)
      ]);

      const [tokenPrice, tokenMetadata, blockStats, networkActivity, pairReserves, tokenTransfers] = apiCalls;

      // Calculate advanced metrics
      const priceData = tokenPrice.status === 'fulfilled' ? tokenPrice.value : null;
      const metadata = tokenMetadata.status === 'fulfilled' ? tokenMetadata.value : null;
      const blocks = blockStats.status === 'fulfilled' ? blockStats.value : null;
      const activity = networkActivity.status === 'fulfilled' ? networkActivity.value : null;
      const reserves = pairReserves.status === 'fulfilled' ? pairReserves.value : null;
      const transfers = tokenTransfers.status === 'fulfilled' ? tokenTransfers.value : null;

      // Advanced market analysis
      const marketMetrics = this.calculateMarketMetrics(priceData, activity, reserves, transfers);

      return {
        price: priceData,
        metadata: metadata,
        blockStats: blocks,
        networkActivity: activity,
        pairReserves: reserves,
        tokenTransfers: transfers,
        marketMetrics: marketMetrics,
        timestamp: Date.now(),
        dataQuality: {
          price: tokenPrice.status,
          metadata: tokenMetadata.status,
          blocks: blockStats.status,
          activity: networkActivity.status,
          reserves: pairReserves.status,
          transfers: tokenTransfers.status
        }
      };
    } catch (error) {
      console.warn('Moralis API error:', error);
      return { 
        error: 'Moralis data unavailable',
        price: null,
        metadata: null,
        blockStats: null,
        networkActivity: null,
        pairReserves: null,
        tokenTransfers: null,
        marketMetrics: {},
        timestamp: Date.now(),
        dataQuality: { error: 'all_failed' }
      };
    }
  }

  private async getTokenTransfers(tokenAddress: string, chain: string) {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2/erc20/${tokenAddress}/transfers?chain=${chain}&limit=100`,
        { 
          headers: { 
            'X-API-Key': process.env.MORALIS_API_KEY || '',
            'Accept': 'application/json'
          } 
        }
      );
      return response.json();
    } catch (error) {
      console.warn('Token transfers API error:', error);
      return { result: [], total: 0 };
    }
  }

  private derivePairAddress(token0: string, token1: string, chainId: number): string {
    // Derive common pair addresses for major DEXes (simplified for demo)
    // In production, this would query DEX factories
    const commonPairs: Record<string, string> = {
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48_0xdAC17F958D2ee523a2206206994597C13D831ec7': '0x3041cbd36888becc7bbcbc0045f3fb98effd6f42', // USDC/USDT
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2_0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc', // WETH/USDC
    };
    
    const key = [token0, token1].sort().join('_');
    return commonPairs[key] || '0x0000000000000000000000000000000000000000';
  }

  private calculateMarketMetrics(priceData: any, activity: any, reserves: any, transfers: any) {
    try {
      // Calculate advanced market metrics
      const volume24h = transfers?.result?.reduce((sum: number, tx: any) => {
        return sum + (parseFloat(tx.value || 0) / Math.pow(10, tx.decimals || 18));
      }, 0) || 0;

      const uniqueSenders = new Set(transfers?.result?.map((tx: any) => tx.from_address)).size;
      const uniqueReceivers = new Set(transfers?.result?.map((tx: any) => tx.to_address)).size;

      const priceChange24h = priceData?.usdPriceFormatted ? 
        ((priceData.usdPriceFormatted - (priceData['24hrPercentChange'] || 0)) / priceData.usdPriceFormatted * 100) : 0;

      const liquidityScore = reserves?.reserve0 && reserves?.reserve1 ? 
        Math.log(parseFloat(reserves.reserve0) * parseFloat(reserves.reserve1)) : 0;

      return {
        volume24h,
        uniqueSenders,
        uniqueReceivers,
        priceChange24h,
        liquidityScore,
        networkUtilization: activity?.total || 0,
        marketActivity: uniqueSenders + uniqueReceivers,
        liquidityHealth: liquidityScore > 20 ? 'GOOD' : liquidityScore > 10 ? 'MEDIUM' : 'LOW',
        trend: priceChange24h > 5 ? 'BULLISH' : priceChange24h < -5 ? 'BEARISH' : 'NEUTRAL'
      };
    } catch (error) {
      console.warn('Market metrics calculation error:', error);
      return {
        volume24h: 0,
        uniqueSenders: 0,
        uniqueReceivers: 0,
        priceChange24h: 0,
        liquidityScore: 0,
        networkUtilization: 0,
        marketActivity: 0,
        liquidityHealth: 'UNKNOWN',
        trend: 'UNKNOWN'
      };
    }
  }

  private async analyzeMarketSentiment(order: any, duneData?: any, moralisData?: any) {
    const startTime = Date.now();
    
    try {
      const aiAnalysisResponse = await this.aiEngine.generateTextWithFallback(
        `Analizza il sentiment del mercato per la coppia ${order.tokenIn}/${order.tokenOut} utilizzando dati avanzati:

          DATI ON-CHAIN (Dune Analytics):
          - Attività delle balene: ${JSON.stringify(duneData?.whaleActivity?.slice(0, 5) || [])}
          - Salute della liquidità: ${JSON.stringify(duneData?.liquidity?.slice(0, 5) || [])}
          - Ottimizzazione del gas: ${JSON.stringify(duneData?.gasOptimization?.slice(0, 5) || [])}
          - Attività MEV: ${JSON.stringify(duneData?.mevActivity?.slice(0, 5) || [])}
          - Efficienza cross-chain: ${JSON.stringify(duneData?.bridgeEfficiency?.slice(0, 5) || [])}

          DATI REAL-TIME (Moralis):
          - Prezzo corrente: ${JSON.stringify(moralisData?.price || {})}
          - Volume 24h: ${moralisData?.marketMetrics?.volume24h || 0}
          - Trend del prezzo: ${moralisData?.marketMetrics?.trend || 'NEUTRAL'}
          - Salute della liquidità: ${moralisData?.marketMetrics?.liquidityHealth || 'UNKNOWN'}
          - Attività di rete: ${moralisData?.marketMetrics?.marketActivity || 0}
          - Cambiamento prezzo 24h: ${moralisData?.marketMetrics?.priceChange24h || 0}%

          Considera:
          1. Trend recenti e momentum
          2. Volumi di scambio e liquidità
          3. Attività delle balene e smart money
          4. Condizioni di rete e ottimizzazione del gas
          5. Attività MEV e front-running
          6. Sentiment cross-chain e ponte efficiency
          7. Timing ottimale per l'entrata/uscita

          Fornisci:
          - Punteggio sentiment da -100 (molto negativo) a +100 (molto positivo)
          - Analisi dettagliata dei fattori chiave
          - Raccomandazione di timing
          - Avvisi di rischio specifici

          Rispondi SOLO con JSON valido:`,
        { temperature: 0.2 }
      );

      const result = {
        score: this.extractSentimentScore(String(aiAnalysisResponse.data || '')),
        explanation: String(aiAnalysisResponse.data || ''),
        timestamp: Date.now(),
        dataSources: {
          dune: duneData?.dataQuality || {},
          moralis: moralisData?.dataQuality || {}
        }
      };

      this.monitoring.recordMetric({
        id: `sentiment_analysis-${Date.now()}`,
        provider: 'openrouter',
        operation: 'sentiment_analysis',
        success: true,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date()
      });

      return result;
      
    } catch (error) {
      this.monitoring.recordMetric({
        id: `sentiment_analysis-${Date.now()}`,
        provider: 'openrouter',
        operation: 'sentiment_analysis',
        success: false,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date(),
        error: (error as any)?.message || String(error)
      });
      throw error;
    }
  }

  private calculateOverallDataQuality(duneData: any, moralisData: any): number {
    let score = 0;
    let factors = 0;

    // Dune data quality
    if (duneData.dataQuality) {
      Object.values(duneData.dataQuality).forEach((status: any) => {
        if (status === 'fulfilled') score += 20;
        factors += 20;
      });
    }

    // Moralis data quality
    if (moralisData.dataQuality) {
      Object.values(moralisData.dataQuality).forEach((status: any) => {
        if (status === 'fulfilled') score += 16.67;
        factors += 16.67;
      });
    }

    return factors > 0 ? Math.round(score * 100 / factors) : 0;
  }

  private buildMarketAnalysisPrompt(order: any, duneData: any, moralisData: any, sentiment: any) {
    return `Sei un esperto analista DeFi con accesso a dati avanzati on-chain e real-time. Analizza questa operazione proposta con massima precisione:

    ORDINE: ${order.type} ${order.amount} ${order.tokenIn} → ${order.tokenOut}
    Chain: ${order.chainId} | Slippage max: ${order.maxSlippage}% | Fee max: ${order.maxFee}%
    Target profit: ${order.targetProfit}% | Stop loss: ${order.stopLoss}%
    Urgency: ${order.urgency} | Timeframe: ${order.timeframe}

    DATI ON-CHAIN AVANZATI (Dune Analytics):
    - Attività Whale: ${JSON.stringify(duneData.whaleActivity?.slice(0, 3) || [])}
    - Salute Liquidità: ${JSON.stringify(duneData.liquidity?.slice(0, 3) || [])}
    - Ottimizzazione Gas: ${JSON.stringify(duneData.gasOptimization?.slice(0, 3) || [])}
    - Attività MEV: ${JSON.stringify(duneData.mevActivity?.slice(0, 3) || [])}
    - Efficienza Cross-Chain: ${JSON.stringify(duneData.bridgeEfficiency?.slice(0, 3) || [])}
    - Qualità Dati: ${JSON.stringify(duneData.dataQuality || {})}

    DATI REAL-TIME AVANZATI (Moralis Web3):
    - Prezzo Token: ${JSON.stringify(moralisData.price || {})}
    - Metadata: ${JSON.stringify(moralisData.metadata || {})}
    - Statistiche Block: ${JSON.stringify(moralisData.blockStats || {})}
    - Attività Network: ${JSON.stringify(moralisData.networkActivity || {})}
    - Riserve Pair: ${JSON.stringify(moralisData.pairReserves || {})}
    - Trasferimenti: ${moralisData.tokenTransfers?.total || 0} transazioni
    - Metriche Mercato: ${JSON.stringify(moralisData.marketMetrics || {})}
    - Qualità Dati: ${JSON.stringify(moralisData.dataQuality || {})}

    ANALISI SENTIMENT MERCATO:
    - Score: ${sentiment.score}/100 (${sentiment.score > 0 ? 'POSITIVO' : sentiment.score < 0 ? 'NEGATIVO' : 'NEUTRO'})
    - Fonti Dati: ${JSON.stringify(sentiment.dataSources || {})}

    PARAMETRI CHIAVE DA ANALIZZARE:
    1. MOMENTUM E TREND
       - Direzione trend price (24h): ${moralisData.marketMetrics?.priceChange24h || 0}%
       - Volume attività: ${moralisData.marketMetrics?.marketActivity || 0}
       - Sentiment aggregato: ${sentiment.score}/100

    2. LIQUIDITÀ E SLIPPAGE
       - Salute liquidità: ${moralisData.marketMetrics?.liquidityHealth || 'UNKNOWN'}
       - Score liquidità: ${moralisData.marketMetrics?.liquidityScore || 0}
       - Riserve DEX: ${JSON.stringify(moralisData.pairReserves || {})}

    3. GAS E OPTIMIZATION
       - Condizioni gas (Dune): ${duneData.gasOptimization?.length || 0} segnali
       - Network utilization: ${moralisData.marketMetrics?.networkUtilization || 0}

    4. RISCHI SPECIFICI
       - Attività MEV rilevata: ${duneData.mevActivity?.length || 0} eventi
       - Movimenti whale: ${duneData.whaleActivity?.length || 0} transazioni
       - Qualità complessiva dati: ${this.calculateOverallDataQuality(duneData, moralisData)}/100

    Fornisci analisi ESTREMAMENTE DETTAGLIATA:
    1. RACCOMANDAZIONE FINALE: EXECUTE/HOLD/WAIT con score affidabilità 0-100
    2. ANALISI RISCHI QUANTIFICATA: elenca 5 rischi principali con probabilità %
    3. TIMING OTTIMALE: momento esatto (ora/giorno) per esecuzione
    4. STRATEGIA DI ENTRATA/USCITA: prezzo target, slippage ottimale, gas strategy
    5. ALTERNATIVE CONSIGLIATE: se HOLD/WAIT, suggerisci alternative migliori
    6. PARAMETRI DI SUCCESSO: KPI specifici per monitorare performance
    7. SCENARI DI RISCHIO: cosa fare se mercato si muove contro

    CRITERI DI ESECUZIONE:
    - EXECUTE solo se: score affidabilità >75, rischi <25%, profitto atteso >1%
    - HOLD se: condizioni neutre, aspettare segnali più forti
    - WAIT se: mercato volatile, timing non ottimale, rischi elevati

    Rispondi SOLO con JSON valido e COMPLETO:`;
  }

  async optimizeExecution(order: z.infer<typeof ExecutionOrderSchema>) {
    const startTime = Date.now();
    
    try {
      const optimizationResponse = await this.aiEngine.generateTextWithFallback(
        `Ottimizza questa operazione DeFi per massimizzare profitto e minimizzare fees:

          ORDINE: ${order.type} ${order.amount} ${order.tokenIn} → ${order.tokenOut}
          Chain: ${order.chainId} | Urgency: ${order.urgency}

          Suggerisci:
          1. Miglior DEX/router per minime fees
          2. Timing ottimale (ora del giorno, giorno della settimana)
          3. Strategia di splitting se amount è grande
          4. Gas optimization techniques
          5. MEV protection strategies

          Rispondi con JSON valido contenente strategia dettagliata:`,
        { temperature: 0.2, cacheTTLMs: 5 * 60 * 1000 }
      );

      const result = {
        success: true,
        optimization: JSON.parse(String(optimizationResponse.data || '')),
        originalOrder: order
      };

      this.monitoring.recordMetric({
        id: `execution_optimization-${Date.now()}`,
        provider: 'openrouter',
        operation: 'execution_optimization',
        success: true,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date()
      });

      return result;
      
    } catch (error) {
      this.monitoring.recordMetric({
        id: `execution_optimization-${Date.now()}`,
        provider: 'openrouter',
        operation: 'execution_optimization',
        success: false,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date(),
        error: (error as any)?.message || String(error)
      });
      throw error;
    }
  }

  async executeOrder(order: z.infer<typeof ExecutionOrderSchema>) {
    const orderId = this.generateOrderId(order);
    const startTime = Date.now();
    
    try {
      const networkKey = this.getNetworkKeyByChainId(order.chainId);
      if (!isL2Network(networkKey)) {
        throw new Error('Operazioni consentite solo su L2 (Base/Optimism/Arbitrum).');
      }
      const preferred = getPreferredExecutionNetworks();
      if (!preferred.includes(networkKey)) {
        throw new Error(`Rete non preferita per esecuzione. Usa: ${preferred.join(', ')}`);
      }

      const minProfitUSD = getMinProfitUSDForNetwork(networkKey);
      await this.getUsdPrice(order.tokenIn, order.chainId);
      const estimatedProfitUSD = this.estimateProfitUSD(order);
      if (estimatedProfitUSD < minProfitUSD) {
        throw new Error(`Profitto stimato ${estimatedProfitUSD.toFixed(2)} USD inferiore alla soglia minima ${minProfitUSD} USD. Eseguire batching fino al superamento soglia.`);
      }

      if (!this.isEconomicallyViable(order, estimatedProfitUSD)) {
        throw new Error('Ordine non sostenibile: ricavo da performance fee insufficiente rispetto al costo AI. Accumulare profitti o alzare la soglia.');
      }
      this.monitoring.recordMetric({
        id: `economics_check-${Date.now()}`,
        provider: 'ai_engine',
        operation: 'economics_check',
        success: true,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date()
      });
      // 1. Analisi mercato
      const marketAnalysis = await this.analyzeMarketConditions(order);
      
      if (marketAnalysis.analysis.recommendation.score < 60) {
        throw new Error(`Mercato sfavorevole: score ${marketAnalysis.analysis.recommendation.score}`);
      }

      // 2. Ottimizzazione esecuzione
      const optimization = await this.optimizeExecution(order);
      
      // 3. Simulazione e risk check
      const simulation = await this.simulateExecution(optimization.optimization);
      
      if (simulation.riskLevel === 'HIGH') {
        throw new Error('Rischio troppo elevato per l\'esecuzione');
      }

      // 4. Preparazione transazione
      const txData = await this.prepareTransaction(optimization.optimization, simulation);

      const executionResult = {
        orderId,
        marketAnalysis: marketAnalysis.analysis,
        optimization: optimization.optimization,
        simulation,
        transaction: txData,
        timestamp: Date.now(),
        status: 'READY_FOR_EXECUTION'
      };

      this.executionHistory.set(orderId, executionResult);
      
      // Record success metric
      this.monitoring.recordMetric({
        id: `order_execution-${Date.now()}`,
        provider: 'ai_engine',
        operation: 'order_execution',
        success: true,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date()
      });
      
      return {
        success: true,
        orderId,
        result: executionResult
      };

    } catch (error) {
      this.monitoring.recordMetric({
        id: `order_execution-${Date.now()}`,
        provider: 'ai_engine',
        operation: 'order_execution',
        success: false,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date(),
        error: (error as any)?.message || String(error)
      });

      throw error;
    }
  }

  private async simulateExecution(optimization: any) {
    // Simulazione realistica dell'esecuzione
    return {
      expectedProfit: optimization.expectedProfit || 0,
      expectedFees: optimization.expectedFees || 0,
      slippage: optimization.expectedSlippage || 0,
      successRate: optimization.successRate || 85,
      riskLevel: optimization.riskLevel || 'MEDIUM',
      gasEstimate: optimization.gasEstimate || 150000
    };
  }

  private async prepareTransaction(optimization: any, simulation: any) {
    // Preparazione dati transazione per firma wallet
    return {
      to: optimization.contractAddress,
      data: optimization.calldata,
      value: optimization.value || '0',
      gasLimit: simulation.gasEstimate,
      gasPrice: optimization.suggestedGasPrice,
      chainId: optimization.chainId
    };
  }

  private getChainName(chainId: number): string {
    const chains: Record<number, string> = {
      1: 'eth',
      56: 'bsc',
      137: 'polygon',
      42161: 'arbitrum',
      10: 'optimism',
      8453: 'base'
    };
    return chains[chainId] || 'eth';
  }

  private getNetworkKeyByChainId(chainId: number): string {
    const map: Record<number, string> = {
      1: 'ethereum',
      137: 'polygon',
      42161: 'arbitrum',
      10: 'optimism',
      8453: 'base'
    };
    return map[chainId] || 'ethereum';
  }

  private isStableSymbol(symbol?: string): boolean {
    const s = (symbol || '').toUpperCase();
    return s.includes('USDC') || s.includes('USDT') || s.includes('DAI') || s.includes('USDCE');
  }

  private estimateProfitUSD(order: z.infer<typeof ExecutionOrderSchema>): number {
    const amountDec = parseFloat(order.amount || '0');
    const profitPct = order.targetProfit || 0;
    const estProfitToken = amountDec * (profitPct / 100);
    if (this.isStableSymbol(order.tokenIn) || this.isStableSymbol(order.tokenOut)) {
      return estProfitToken;
    }
    const price = this.getCachedUsdPriceSync(order.tokenIn, order.chainId);
    return estProfitToken * (price || 1);
  }

  private getCachedUsdPriceSync(tokenAddress: string, chainId: number): number | null {
    const key = `${chainId}:${tokenAddress}`.toLowerCase();
    const cached = this.priceCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.price;
    return null;
  }

  private async getUsdPrice(tokenAddress: string, chainId: number): Promise<number | null> {
    const key = `${chainId}:${tokenAddress}`.toLowerCase();
    const cached = this.priceCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.price;
    try {
      const chain = this.getChainName(chainId);
      const resp = await this.moralisClient.getTokenPrice({ address: tokenAddress, chain });
      const p = typeof resp?.usdPrice !== 'undefined' ? Number(resp.usdPrice) : Number(resp?.usdPriceFormatted);
      if (!isNaN(p) && p > 0) {
        this.priceCache.set(key, { price: p, expires: Date.now() + 5 * 60 * 1000 });
        return p;
      }
      return null;
    } catch {
      return null;
    }
  }

  private isEconomicallyViable(order: z.infer<typeof ExecutionOrderSchema>, estimatedProfitUSD: number): boolean {
    const MIN_FEE_PERCENT = 0.10; // lower bound del tier dinamico 10–30%
    const AI_COST_PER_ORDER_USD = 0.05; // stima conservativa con caching e budget
    const revenueUSD = estimatedProfitUSD * MIN_FEE_PERCENT;
    return revenueUSD >= AI_COST_PER_ORDER_USD;
  }

  private extractSentimentScore(analysis: string): number {
    // Estrae punteggio sentiment da analisi AI
    const match = analysis.match(/score[:\s]+(-?\d+)/i);
    return match && match[1] ? parseInt(match[1]) : 0;
  }

  private generateOrderId(order: any): string {
    return `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getExecutionHistory(limit: number = 50) {
    return Array.from(this.executionHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getPerformanceMetrics() {
    const history = this.getExecutionHistory();
    const successful = history.filter(h => h.status === 'EXECUTED_SUCCESS');
    
    return {
      totalOrders: history.length,
      successRate: (successful.length / history.length * 100).toFixed(2),
      avgProfit: this.calculateAvgProfit(successful),
      avgFees: this.calculateAvgFees(successful),
      totalVolume: this.calculateTotalVolume(successful)
    };
  }

  private calculateAvgProfit(executions: any[]): string {
    if (executions.length === 0) return '0.00';
    const total = executions.reduce((sum, ex) => sum + (ex.actualProfit || 0), 0);
    return (total / executions.length).toFixed(2);
  }

  private calculateAvgFees(executions: any[]): string {
    if (executions.length === 0) return '0.00';
    const total = executions.reduce((sum, ex) => sum + (ex.actualFees || 0), 0);
    return (total / executions.length).toFixed(2);
  }

  private calculateTotalVolume(executions: any[]): string {
    if (executions.length === 0) return '0.00';
    const total = executions.reduce((sum, ex) => sum + parseFloat(ex.originalOrder?.amount || 0), 0);
    return total.toFixed(2);
  }

  async feeOptimization(input: { chainId: number; operationType: 'SWAP' | 'BRIDGE' | 'STAKE'; amount: string; urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }) {
    const startTime = Date.now();
    try {
      const resp = await this.aiEngine.generateTextWithFallback(
        `Ottimizza fees per operazione ${input.operationType} su chain ${input.chainId}:
        Amount: ${input.amount}
        Urgency: ${input.urgency}
        Considera:
        1. Gas price ottimale per timing attuale
        2. Strategie di risparmio gas
        3. Alternative con meno fees
        4. Tempo di esecuzione stimato
        Rispondi con JSON contenente ottimizzazione dettagliata.`,
        { temperature: 0.2 }
      );

      this.monitoring.recordMetric({
        id: `fee_optimization-${Date.now()}`,
        provider: 'openrouter',
        operation: 'fee_optimization',
        success: true,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date()
      });

      return JSON.parse(String(resp.data || ''));
    } catch (error) {
      this.monitoring.recordMetric({
        id: `fee_optimization-${Date.now()}`,
        provider: 'openrouter',
        operation: 'fee_optimization',
        success: false,
        latency: Date.now() - startTime,
        retries: 0,
        timestamp: new Date(),
        error: (error as any)?.message || String(error)
      });
      throw error;
    }
  }
}
