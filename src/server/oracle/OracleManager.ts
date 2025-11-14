import { ethers } from 'ethers';
import axios from 'axios';
import { z } from 'zod';

// Schema per validare i dati oracle
const OracleDataSchema = z.object({
  price: z.number().positive(),
  timestamp: z.number(),
  source: z.string(),
  confidence: z.number().min(0).max(1),
  signature: z.string().optional()
});

export type OracleData = z.infer<typeof OracleDataSchema>;

export interface OracleConfig {
  chainlink?: {
    priceFeed: string;
    network: string;
  };
  pyth?: {
    priceFeedId: string;
    network: string;
  };
  custom?: {
    endpoint: string;
    apiKey?: string;
  };
}

export class OracleManager {
  private provider: ethers.Provider;
  private config: OracleConfig;
  private cache: Map<string, { data: OracleData; expiry: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor(provider: ethers.Provider, config: OracleConfig) {
    this.provider = provider;
    this.config = config;
  }

  async getPrice(asset: string): Promise<OracleData> {
    const cacheKey = `price_${asset}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    let data: OracleData;

    // Prova Chainlink prima
    if (this.config.chainlink) {
      try {
        data = await this.getChainlinkPrice(asset);
      } catch (error) {
        console.warn('Chainlink failed, trying Pyth:', error);
        // Fallback a Pyth
        if (this.config.pyth) {
          data = await this.getPythPrice(asset);
        } else {
          throw error;
        }
      }
    } else if (this.config.pyth) {
      data = await this.getPythPrice(asset);
    } else if (this.config.custom) {
      data = await this.getCustomPrice(asset);
    } else {
      throw new Error('Nessun oracle configurato');
    }

    // Valida i dati
    const validatedData = OracleDataSchema.parse(data);
    
    // Cachea il risultato
    this.cache.set(cacheKey, {
      data: validatedData,
      expiry: Date.now() + this.CACHE_TTL
    });

    return validatedData;
  }

  private async getChainlinkPrice(asset: string): Promise<OracleData> {
    if (!this.config.chainlink) throw new Error('Chainlink non configurato');

    // Interfaccia per Chainlink Price Feed
    const priceFeedABI = [
      'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
      'function decimals() external view returns (uint8)'
    ];

    const priceFeed = new ethers.Contract(
      this.config.chainlink.priceFeed,
      priceFeedABI,
      this.provider
    );

    if (!priceFeed || !priceFeed.latestRoundData || !priceFeed.decimals) {
      throw new Error('Price feed contract not properly initialized');
    }
    
    const roundData = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();
    
    const price = Number(ethers.formatUnits(roundData.answer, decimals));
    const timestamp = Number(roundData.updatedAt) * 1000;

    return {
      price,
      timestamp,
      source: 'chainlink',
      confidence: 0.95, // Alta confidenza per Chainlink
      signature: roundData.roundId.toString()
    };
  }

  private async getPythPrice(asset: string): Promise<OracleData> {
    if (!this.config.pyth) throw new Error('Pyth non configurato');

    const response = await axios.get(`https://hermes.pyth.network/v2/updates/price/${this.config.pyth.priceFeedId}`);
    const priceData = response.data;

    return {
      price: priceData.price.price,
      timestamp: priceData.price.publish_time * 1000,
      source: 'pyth',
      confidence: 1 - (priceData.price.conf / priceData.price.price), // Confidenza basata su confidenza Pyth
      signature: priceData.price.feed_id
    };
  }

  private async getCustomPrice(asset: string): Promise<OracleData> {
    if (!this.config.custom) throw new Error('Oracle custom non configurato');

    const headers: Record<string, string> = {};
    if (this.config.custom.apiKey) {
      headers['X-API-Key'] = this.config.custom.apiKey;
    }

    const response = await axios.get(`${this.config.custom.endpoint}/price/${asset}`, { headers });
    
    return {
      price: response.data.price,
      timestamp: Date.now(),
      source: 'custom',
      confidence: response.data.confidence || 0.8,
      signature: response.data.signature
    };
  }

  async getMultiplePrices(assets: string[]): Promise<Map<string, OracleData>> {
    const results = new Map<string, OracleData>();
    
    const promises = assets.map(async (asset) => {
      try {
        const data = await this.getPrice(asset);
        results.set(asset, data);
      } catch (error) {
        console.error(`Error retrieving price for ${asset}:`, error);
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Metodo specifico per gaming (prezzi NFT e token gaming)
  async getGamingAssetPrice(game: string, assetType: 'nft' | 'token' | 'reward'): Promise<OracleData> {
    const gamingEndpoints = {
      'axie-infinity': {
        nft: 'https://api.axie.technology/slp-price',
        token: 'https://api.axie.technology/axs-price',
        reward: 'https://api.axie.technology/slp-price'
      },
      'sandbox': {
        nft: 'https://api.sandbox.game/land-price',
        token: 'https://api.coingecko.com/api/v3/simple/price?ids=the-sandbox&vs_currencies=usd',
        reward: 'https://api.sandbox.game/reward-rate'
      },
      'illuvium': {
        nft: 'https://api.illuvium.io/nft-floor-price',
        token: 'https://api.coingecko.com/api/v3/simple/price?ids=illuvium&vs_currencies=usd',
        reward: 'https://api.illuvium.io/yield-rate'
      }
    };

    const endpoint = gamingEndpoints[game as keyof typeof gamingEndpoints]?.[assetType];
    if (!endpoint) {
      throw new Error(`Endpoint non disponibile per ${game} - ${assetType}`);
    }

    const response = await axios.get(endpoint);
    
    let price: number;
    switch (assetType) {
      case 'nft':
        price = response.data.floor_price || response.data.price || 0;
        break;
      case 'token':
        price = response.data.the_sandbox?.usd || response.data.illuvium?.usd || response.data.price || 0;
        break;
      case 'reward':
        price = response.data.reward_rate || response.data.slp_price || 0;
        break;
    }

    return {
      price,
      timestamp: Date.now(),
      source: `${game}-api`,
      confidence: 0.85,
      signature: `${game}-${assetType}-${Date.now()}`
    };
  }

  // Metodo specifico per supply chain (prezzi commodity, shipping rates)
  async getSupplyChainPrice(commodity: string, region: string): Promise<OracleData> {
    const supplyEndpoints = {
      'shipping': `https://api.freightos.com/spot-rate?origin=${region.split('-')[0]}&destination=${region.split('-')[1]}`,
      'commodity': `https://api.commodities-api.com/latest?base=USD&symbols=${commodity}`,
      'invoice': `https://api.tradefinance.com/discount-rate?commodity=${commodity}&region=${region}`
    };

    const endpoint = supplyEndpoints[commodity as keyof typeof supplyEndpoints];
    if (!endpoint) {
      throw new Error(`Endpoint non disponibile per ${commodity}`);
    }

    const response = await axios.get(endpoint);
    
    let price: number;
    switch (commodity) {
      case 'shipping':
        price = response.data.spot_rate || 0;
        break;
      case 'commodity':
        price = response.data.data?.rates?.[commodity] || 0;
        break;
      case 'invoice':
        price = response.data.discount_rate || 0;
        break;
      default:
        price = 0;
    }

    return {
      price,
      timestamp: Date.now(),
      source: `${commodity}-oracle`,
      confidence: 0.9,
      signature: `${commodity}-${region}-${Date.now()}`
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}