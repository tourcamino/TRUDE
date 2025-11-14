import { useState } from 'react';
import { useTRPC } from '~/trpc/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Shield, 
  Target,
  DollarSign,
  BarChart3,
  Clock
} from 'lucide-react';

interface StrategyRecommendation {
  condition: 'BULL' | 'BEAR' | 'STAGNANT' | 'VOLATILE';
  strategy: 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED' | 'ARBITRAGE';
  recommendedAllocation: {
    stablecoins: number;
    blueChips: number;
    altcoins: number;
    defi: number;
    cash: number;
  };
  expectedDailyROI: number;
  confidence: number;
  riskScore: number;
  reasoning: string;
  timeframe: '1D' | '1W' | '1M';
}

export function ROIStrategyEngine() {
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [selectedStrategy, setSelectedStrategy] = useState<'guaranteed' | 'relaxed' | 'custom'>('guaranteed');
  const [customROI, setCustomROI] = useState<number>(0.01);
  
  const { data: marketCondition } = useTRPC().getMarketCondition.useQuery();
  const guaranteedStrategy = useTRPC().getGuaranteedStrategy.useMutation();
  const relaxedStrategy = useTRPC().getRelaxedStrategy.useMutation();
  const customStrategy = useTRPC().generateStrategy.useMutation();
  
  const [strategy, setStrategy] = useState<StrategyRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStrategy = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (selectedStrategy) {
        case 'guaranteed':
          result = await guaranteedStrategy.mutateAsync({
            investmentAmount,
            timeframe: '1D',
          });
          setStrategy(result.recommendation);
          break;
          
        case 'relaxed':
          result = await relaxedStrategy.mutateAsync({
            investmentAmount,
            targetROI: 0.005, // 0.5% daily for relaxed
          });
          setStrategy(result.recommendation);
          break;
          
        case 'custom':
          result = await customStrategy.mutateAsync({
            config: {
              targetDailyROI: customROI,
              maxDrawdown: 0.02,
              riskLevel: 5,
              minInvestment: investmentAmount,
              autoRebalance: true,
              stopLoss: 0.01,
              takeProfit: customROI * 1.5,
            },
          });
          setStrategy(result.recommendation);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate strategy');
    } finally {
      setLoading(false);
    }
  };

  const getMarketIcon = (condition: string) => {
    switch (condition) {
      case 'BULL': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'BEAR': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'STAGNANT': return <Minus className="h-5 w-5 text-yellow-500" />;
      case 'VOLATILE': return <Zap className="h-5 w-5 text-purple-500" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'AGGRESSIVE': return 'bg-red-100 text-red-800';
      case 'CONSERVATIVE': return 'bg-green-100 text-green-800';
      case 'BALANCED': return 'bg-blue-100 text-blue-800';
      case 'ARBITRAGE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-600';
    if (riskScore <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const expectedReturn = strategy ? investmentAmount * strategy.expectedDailyROI : 0;
  const monthlyReturn = expectedReturn * 30;
  const yearlyReturn = expectedReturn * 365;

  return (
    <div className="space-y-6">
      {/* Market Condition Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Current Market Condition
          </CardTitle>
          <CardDescription>
            Real-time market analysis for optimal strategy selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketCondition ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMarketIcon(marketCondition.condition)}
                <div>
                  <div className="font-semibold capitalize">{marketCondition.condition}</div>
                  <div className="text-sm text-gray-600">
                    Volatility: {marketCondition.metrics.volatility24h.toFixed(1)}% | 
                    24h Change: {marketCondition.metrics.priceChange24h.toFixed(1)}%
                  </div>
                </div>
              </div>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(marketCondition.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          ) : (
            <div className="text-gray-500">Loading market data...</div>
          )}
        </CardContent>
      </Card>

      {/* Strategy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Strategy Configuration
          </CardTitle>
          <CardDescription>
            Configure your investment strategy based on market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="investment">Investment Amount (USD)</Label>
              <Input
                id="investment"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min="1"
                step="100"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="strategy">Strategy Type</Label>
              <select
                id="strategy"
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value as any)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="guaranteed">1% Guaranteed Daily</option>
                <option value="relaxed">Relaxed (0.5% Daily)</option>
                <option value="custom">Custom Strategy</option>
              </select>
            </div>
          </div>

          {selectedStrategy === 'custom' && (
            <div>
              <Label htmlFor="customROI">Target Daily ROI (%)</Label>
              <Input
                id="customROI"
                type="number"
                value={customROI * 100}
                onChange={(e) => setCustomROI(Number(e.target.value) / 100)}
                min="0.1"
                max="10"
                step="0.1"
                className="mt-1"
              />
            </div>
          )}

          <Button 
            onClick={generateStrategy} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Generating Strategy...' : 'Generate Strategy'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Strategy Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Strategy Results */}
      {strategy && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Recommended Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMarketIcon(strategy.condition)}
                  <span className="font-medium capitalize">{strategy.condition} Market</span>
                </div>
                <Badge className={getStrategyColor(strategy.strategy)}>
                  {strategy.strategy}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Daily ROI:</span>
                    <span className="font-semibold text-green-600">
                      {(strategy.expectedDailyROI * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold">
                      {(strategy.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Score:</span>
                    <span className={`font-semibold ${getRiskColor(strategy.riskScore)}`}>
                      {strategy.riskScore}/10
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Return:</span>
                    <span className="font-semibold text-green-600">
                      ${expectedReturn.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Return:</span>
                    <span className="font-semibold text-green-600">
                      ${monthlyReturn.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yearly Return:</span>
                    <span className="font-semibold text-green-600">
                      ${yearlyReturn.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="font-medium mb-2">Asset Allocation</div>
                <div className="space-y-2">
                  {Object.entries(strategy.recommendedAllocation).map(([asset, percentage]) => (
                    <div key={asset} className="flex justify-between text-sm">
                      <span className="capitalize">{asset.replace('_', ' ')}:</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTitle>Strategy Reasoning</AlertTitle>
                <AlertDescription>{strategy.reasoning}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Investment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(strategy.recommendedAllocation).map(([asset, percentage]) => {
                  const amount = investmentAmount * (percentage / 100);
                  return (
                    <div key={asset} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{asset.replace('_', ' ')}</span>
                      <div className="text-right">
                        <div className="font-semibold">${amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}