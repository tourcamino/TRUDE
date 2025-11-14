export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  tier?: 'L1' | 'L2';
  economics?: {
    minProfitUSD: number;
  };
  oracle?: {
    chainlink?: {
      priceFeed: string;
    };
    pyth?: {
      priceFeedId: string;
    };
  };
}

export interface OracleConfig {
  chainlink?: {
    priceFeed: string;
    network: string;
  };
  pyth?: {
    priceFeedId: string;
    network: string;
  };
}

export const NETWORKS: Record<string, NetworkConfig> = {
  // Ethereum Mainnet
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    tier: 'L1',
    economics: {
      minProfitUSD: 5,
    },
    oracle: {
      chainlink: {
        priceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' // ETH/USD
      },
      pyth: {
        priceFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
      }
    }
  },

  // Polygon
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    tier: 'L2',
    economics: {
      minProfitUSD: 0.30,
    },
    oracle: {
      chainlink: {
        priceFeed: '0xF9680D99D6C9589e2a93a78A04A279E5096b38E5' // MATIC/USD
      },
      pyth: {
        priceFeedId: '0x6de0a5d8e92d68d7d8e67d8e3c8f3a6c9c2e8d1e7f8a9b0c1d2e3f4a5b6c7d8e9f0'
      }
    }
  },

  // Arbitrum
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    tier: 'L2',
    economics: {
      minProfitUSD: 0.35,
    },
    oracle: {
      chainlink: {
        priceFeed: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba61D' // ETH/USD
      }
    }
  },

  // Optimism
  optimism: {
    name: 'Optimism',
    chainId: 10,
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    tier: 'L2',
    economics: {
      minProfitUSD: 0.40,
    },
    oracle: {
      chainlink: {
        priceFeed: '0x13e3Ee699D1909e989722E753853AE37b51FA4Ca' // ETH/USD
      }
    }
  },

  // Base
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    tier: 'L2',
    economics: {
      minProfitUSD: 0.25,
    },
    oracle: {
      chainlink: {
        priceFeed: '0x71041dddad4585F9D3d0D5A3B3c3e2bF8d6A2b8D' // ETH/USD
      }
    }
  }
};

export function getNetworkConfig(chain: string): NetworkConfig {
  const config = NETWORKS[chain.toLowerCase()];
  if (!config) {
    throw new Error(`Network ${chain} not supported`);
  }
  return config;
}



export function getOracleConfigForNetwork(network: string): OracleConfig {
  const networkConfig = getNetworkConfig(network);
  const oracleConfig: OracleConfig = {
    chainlink: networkConfig.oracle?.chainlink ? {
      priceFeed: networkConfig.oracle.chainlink.priceFeed,
      network: network
    } : undefined,
    pyth: networkConfig.oracle?.pyth ? {
      priceFeedId: networkConfig.oracle.pyth.priceFeedId,
      network: network
    } : undefined
  };
  
  return oracleConfig;
}

export function getPreferredExecutionNetworks(): string[] {
  return ['base', 'optimism', 'arbitrum', 'polygon'];
}

export function isL2Network(networkKey: string): boolean {
  const cfg = NETWORKS[networkKey];
  return cfg?.tier === 'L2';
}

export function getMinProfitUSDForNetwork(networkKey: string): number {
  const cfg = NETWORKS[networkKey];
  return cfg?.economics?.minProfitUSD ?? 1;
}