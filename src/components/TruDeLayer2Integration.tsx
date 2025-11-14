import React, { useState, useEffect } from 'react';
import { Network, Zap, DollarSign, TrendingUp } from 'lucide-react';

interface NetworkInfo {
  name: string;
  chainId: number;
  gasFees: string;
  oracleSupport: string[];
  verticalOptimization: string[];
  status: 'active' | 'recommended' | 'deprecated';
}

const NETWORKS_DATA: Record<string, NetworkInfo> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    gasFees: '$10-50',
    oracleSupport: ['Chainlink', 'Pyth'],
    verticalOptimization: ['DeFi', 'Supply Chain'],
    status: 'active'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    gasFees: '$0.01-0.10',
    oracleSupport: ['Chainlink', 'Pyth'],
    verticalOptimization: ['Gaming', 'NFT'],
    status: 'recommended'
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    gasFees: '$0.50-2.00',
    oracleSupport: ['Chainlink'],
    verticalOptimization: ['Supply Chain', 'Enterprise'],
    status: 'recommended'
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    gasFees: '$0.30-1.50',
    oracleSupport: ['Chainlink'],
    verticalOptimization: ['DeFi', 'Trading'],
    status: 'active'
  },
  base: {
    name: 'Base',
    chainId: 8453,
    gasFees: '$0.01-0.05',
    oracleSupport: ['Chainlink'],
    verticalOptimization: ['Gaming', 'Social'],
    status: 'recommended'
  }
};

interface TruDeLayer2IntegrationProps {
  selectedVertical?: string;
  onNetworkSelect?: (network: string) => void;
}

export default function TruDeLayer2Integration({ 
  selectedVertical, 
  onNetworkSelect 
}: TruDeLayer2IntegrationProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');
  const [showDetails, setShowDetails] = useState(false);

  const getRecommendedNetworks = () => {
    if (!selectedVertical) return Object.keys(NETWORKS_DATA);
    
    return Object.entries(NETWORKS_DATA)
      .filter(([_, data]) => data.verticalOptimization.includes(selectedVertical))
      .map(([key, _]) => key);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'deprecated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    onNetworkSelect?.(network);
  };

  const currentNetwork = NETWORKS_DATA[selectedNetwork];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Network className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Layer 2 Integration</h2>
            <p className="text-gray-600">Optimized networks for each vertical</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Gas Optimized</span>
        </div>
      </div>

      {/* Network Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(NETWORKS_DATA).map(([key, data]) => {
          const isRecommended = getRecommendedNetworks().includes(key);
          const isSelected = selectedNetwork === key;
          
          return (
            <div
              key={key}
              onClick={() => handleNetworkSelect(key)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{data.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Gas Fees:</span>
                  <span className="font-medium">{data.gasFees}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Oracle:</span>
                  <span className="font-medium">{data.oracleSupport.join(', ')}</span>
                </div>
                
                {isRecommended && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>Recommended for {selectedVertical}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Network Details */}
      {currentNetwork && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentNetwork.name} Details
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Network Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chain ID:</span>
                      <span>{currentNetwork.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas Range:</span>
                      <span>{currentNetwork.gasFees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(currentNetwork.status)}`}>
                        {currentNetwork.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Oracle Support</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentNetwork.oracleSupport.map((oracle) => (
                      <span
                        key={oracle}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {oracle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vertical Optimization</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentNetwork.verticalOptimization.map((vertical) => (
                      <span
                        key={vertical}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {vertical}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Cost Savings</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    {selectedNetwork === 'polygon' && 'Save up to 99% on gas fees vs Ethereum'}
                    {selectedNetwork === 'arbitrum' && 'Enterprise-grade security with 95% cost reduction'}
                    {selectedNetwork === 'optimism' && 'Lightning-fast DeFi with 97% lower costs'}
                    {selectedNetwork === 'base' && 'Ultra-low costs with Coinbase backing'}
                    {selectedNetwork === 'ethereum' && 'Maximum security and liquidity'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integration Status */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-medium">Oracle Integration Active</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Real-time data feeds from Chainlink and Pyth networks enabled
        </p>
      </div>
    </div>
  );
}