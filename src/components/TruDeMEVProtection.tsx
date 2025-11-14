import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MEVProtectionStatus {
  enabled: boolean;
  protectionLevel: 'basic' | 'advanced' | 'enterprise';
  transactionsProtected: number;
  estimatedSavings: number;
  lastUpdate: Date;
}

interface MEVProtectionConfig {
  flashbotsEnabled: boolean;
  privateMempool: boolean;
  commitReveal: boolean;
  sandwichProtection: boolean;
  frontRunningProtection: boolean;
}

const TruDeMEVProtection: React.FC = () => {
  const [protectionStatus, setProtectionStatus] = useState<MEVProtectionStatus>({
    enabled: true,
    protectionLevel: 'advanced',
    transactionsProtected: 1247,
    estimatedSavings: 2847.50,
    lastUpdate: new Date()
  });

  const [config, setConfig] = useState<MEVProtectionConfig>({
    flashbotsEnabled: true,
    privateMempool: true,
    commitReveal: false,
    sandwichProtection: true,
    frontRunningProtection: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const getProtectionLevelColor = (level: string) => {
    switch (level) {
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'basic': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFeatureStatus = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-yellow-500" />
    );
  };

  const handleConfigChange = (feature: keyof MEVProtectionConfig, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">MEV Protection</h2>
            <p className="text-gray-600">Advanced transaction protection system</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-green-500" />
          <span className="text-sm text-gray-600">Protected</span>
        </div>
      </div>

      {/* Protection Status */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-900">Protection Active</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProtectionLevelColor(protectionStatus.protectionLevel)}`}>
            {protectionStatus.protectionLevel.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {protectionStatus.transactionsProtected.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Transactions Protected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${protectionStatus.estimatedSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Estimated Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">99.7%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Protection Features */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Protection Features</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getFeatureStatus(config.flashbotsEnabled)}
              <div>
                <div className="font-medium text-gray-900">Flashbots Integration</div>
                <div className="text-sm text-gray-600">Private mempool protection</div>
              </div>
            </div>
            <button
              onClick={() => handleConfigChange('flashbotsEnabled', !config.flashbotsEnabled)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                config.flashbotsEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {config.flashbotsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getFeatureStatus(config.sandwichProtection)}
              <div>
                <div className="font-medium text-gray-900">Sandwich Attack Protection</div>
                <div className="text-sm text-gray-600">Prevents price manipulation</div>
              </div>
            </div>
            <button
              onClick={() => handleConfigChange('sandwichProtection', !config.sandwichProtection)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                config.sandwichProtection 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {config.sandwichProtection ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getFeatureStatus(config.frontRunningProtection)}
              <div>
                <div className="font-medium text-gray-900">Front-Running Protection</div>
                <div className="text-sm text-gray-600">Blocks transaction reordering</div>
              </div>
            </div>
            <button
              onClick={() => handleConfigChange('frontRunningProtection', !config.frontRunningProtection)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                config.frontRunningProtection 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {config.frontRunningProtection ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
        </button>

        {showAdvanced && (
          <div className="space-y-3 mt-4 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFeatureStatus(config.privateMempool)}
                <div>
                  <div className="font-medium text-gray-900">Private Mempool</div>
                  <div className="text-sm text-gray-600">Submit transactions privately</div>
                </div>
              </div>
              <button
                onClick={() => handleConfigChange('privateMempool', !config.privateMempool)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  config.privateMempool 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {config.privateMempool ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFeatureStatus(config.commitReveal)}
                <div>
                  <div className="font-medium text-gray-900">Commit-Reveal Scheme</div>
                  <div className="text-sm text-gray-600">Two-phase transaction submission</div>
                </div>
              </div>
              <button
                onClick={() => handleConfigChange('commitReveal', !config.commitReveal)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  config.commitReveal 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {config.commitReveal ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Protection Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Real-time Protection</h4>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Updated {protectionStatus.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Blocked Attacks (24h)</div>
            <div className="font-semibold text-red-600">23</div>
          </div>
          <div>
            <div className="text-gray-600">Saved from MEV (24h)</div>
            <div className="font-semibold text-green-600">$142.30</div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900">Enterprise Security</div>
            <div className="text-sm text-blue-800">
              Our MEV protection uses advanced cryptography and private mempools to ensure 
              your transactions are protected from sandwich attacks, front-running, and other 
              forms of MEV extraction. Enterprise users get priority access to Flashbots bundles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruDeMEVProtection;