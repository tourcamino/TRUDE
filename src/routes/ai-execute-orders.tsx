import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExecutionOrder {
  type: 'BUY' | 'SELL' | 'SWAP' | 'STAKE' | 'UNSTAKE' | 'BRIDGE';
  tokenIn: string;
  tokenOut: string;
  amount: string;
  maxSlippage: number;
  maxFee: number;
  targetProfit: number;
  stopLoss: number;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  chainId: number;
  walletAddress?: string;
}

interface AIAnalysis {
  recommendation: {
    action: 'EXECUTE' | 'HOLD' | 'WAIT';
    score: number;
    confidence: number;
    reasoning: string;
  };
  riskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: string[];
    mitigation: string[];
  };
  timing: {
    optimal: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    marketWindow: string;
  };
}

interface ExecutionResult {
  orderId: string;
  marketAnalysis: AIAnalysis;
  optimization: any;
  simulation: {
    expectedProfit: number;
    expectedFees: number;
    slippage: number;
    successRate: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    gasEstimate: number;
  };
  transaction: any;
  status: string;
}

export default function AIExecuteOrders() {
  const trpc = useTRPC();
  const [order, setOrder] = useState<ExecutionOrder>({
    type: 'SWAP',
    tokenIn: 'WETH',
    tokenOut: 'USDC',
    amount: '1',
    maxSlippage: 1,
    maxFee: 2,
    targetProfit: 1,
    stopLoss: 5,
    timeframe: '1h',
    urgency: 'MEDIUM',
    chainId: 8453
  });

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Queries per dati e metriche
  const { data: metrics } = useQuery({
    queryKey: ['ai-execution-metrics'],
    queryFn: () => trpc.aiExecutionMetrics.query({ limit: 10 })
  });

  // Mutations per analisi ed esecuzione
  const marketAnalysisMutation = useMutation({
    mutationFn: (analysisOrder: any) => trpc.aiMarketAnalysis.mutate(analysisOrder),
    onSuccess: (data) => {
      if (data.success) {
        setAiAnalysis(data.analysis);
        toast.success('AI Analysis Complete');
      }
    },
    onError: (error) => {
      toast.error('AI Analysis Failed');
      console.error(error);
    }
  });

  const executionMutation = useMutation({
    mutationFn: (execOrder: ExecutionOrder) => trpc.aiExecuteOrder.mutate(execOrder),
    onSuccess: (data) => {
      if (data.success) {
        setExecutionResult(data.result);
        toast.success(`Order ${data.orderId} Ready for Execution`);
      }
    },
    onError: (error) => {
      toast.error('Order Execution Failed');
      console.error(error);
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await marketAnalysisMutation.mutateAsync({
        tokenAddress: order.tokenIn,
        chainId: order.chainId,
        timeframe: order.timeframe
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (!aiAnalysis || aiAnalysis.recommendation.action !== 'EXECUTE') {
      toast.error('Cannot execute: AI recommendation is not favorable');
      return;
    }

    try {
      await executionMutation.mutateAsync(order);
    } catch (error) {
      console.error('Execution error:', error);
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'EXECUTE': return 'bg-green-500';
      case 'HOLD': return 'bg-yellow-500';
      case 'WAIT': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Execute Orders</h1>
          <p className="text-gray-300">AI-driven execution engine for optimal DeFi operations</p>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{metrics.metrics.totalOrders}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">{metrics.metrics.successRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Profit</p>
                    <p className="text-2xl font-bold text-white">{metrics.metrics.avgProfit}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Volume</p>
                    <p className="text-2xl font-bold text-white">${metrics.metrics.totalVolume}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="new-order" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="new-order" className="data-[state=active]:bg-slate-700">New Order</TabsTrigger>
            <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-slate-700">AI Analysis</TabsTrigger>
            <TabsTrigger value="execution" className="data-[state=active]:bg-slate-700">Execution</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">History</TabsTrigger>
          </TabsList>

          <TabsContent value="new-order">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Form */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Order Configuration</CardTitle>
                  <CardDescription className="text-gray-400">Configure your DeFi operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Operation Type</label>
                      <Select value={order.type} onValueChange={(value) => setOrder(prev => ({ ...prev, type: value as any }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="SWAP">Swap</SelectItem>
                          <SelectItem value="BUY">Buy</SelectItem>
                          <SelectItem value="SELL">Sell</SelectItem>
                          <SelectItem value="STAKE">Stake</SelectItem>
                          <SelectItem value="BRIDGE">Bridge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Chain</label>
                      <Select value={order.chainId.toString()} onValueChange={(value) => setOrder(prev => ({ ...prev, chainId: parseInt(value) }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="8453">Base</SelectItem>
                          <SelectItem value="56">BSC</SelectItem>
                          <SelectItem value="137">Polygon</SelectItem>
                          <SelectItem value="42161">Arbitrum</SelectItem>
                          <SelectItem value="10">Optimism</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Token In</label>
                      <Input
                        value={order.tokenIn}
                        onChange={(e) => setOrder(prev => ({ ...prev, tokenIn: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="WETH"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Token Out</label>
                      <Input
                        value={order.tokenOut}
                        onChange={(e) => setOrder(prev => ({ ...prev, tokenOut: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="USDC"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-1 block">Amount</label>
                    <Input
                      value={order.amount}
                      onChange={(e) => setOrder(prev => ({ ...prev, amount: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="1.0"
                      type="number"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Max Slippage (%)</label>
                      <Input
                        value={order.maxSlippage}
                        onChange={(e) => setOrder(prev => ({ ...prev, maxSlippage: parseFloat(e.target.value) }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Target Profit (%)</label>
                      <Input
                        value={order.targetProfit}
                        onChange={(e) => setOrder(prev => ({ ...prev, targetProfit: parseFloat(e.target.value) }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Stop Loss (%)</label>
                      <Input
                        value={order.stopLoss}
                        onChange={(e) => setOrder(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="20"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm mb-1 block">Timeframe</label>
                      <Select value={order.timeframe} onValueChange={(value) => setOrder(prev => ({ ...prev, timeframe: value as any }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="1m">1 Minute</SelectItem>
                          <SelectItem value="5m">5 Minutes</SelectItem>
                          <SelectItem value="15m">15 Minutes</SelectItem>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="4h">4 Hours</SelectItem>
                          <SelectItem value="1d">1 Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-1 block">Urgency</label>
                    <Select value={order.urgency} onValueChange={(value) => setOrder(prev => ({ ...prev, urgency: value as any }))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Analysis Results */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">AI Analysis</CardTitle>
                  <CardDescription className="text-gray-400">Market insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  {aiAnalysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div>
                          <p className="text-gray-300 text-sm">AI Recommendation</p>
                          <p className={`text-xl font-bold ${
                            aiAnalysis.recommendation.action === 'EXECUTE' ? 'text-green-400' :
                            aiAnalysis.recommendation.action === 'HOLD' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {aiAnalysis.recommendation.action}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 text-sm">Score</p>
                          <p className="text-2xl font-bold text-white">{aiAnalysis.recommendation.score}/100</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Confidence</span>
                          <span className="text-white font-semibold">{aiAnalysis.recommendation.confidence}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Risk Level</span>
                          <Badge className={`${getRiskColor(aiAnalysis.riskAssessment.level)}`}>
                            {aiAnalysis.riskAssessment.level}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-700 rounded-lg">
                        <p className="text-gray-300 text-sm mb-2">Reasoning</p>
                        <p className="text-white text-sm">{aiAnalysis.recommendation.reasoning}</p>
                      </div>

                      <div className="p-3 bg-slate-700 rounded-lg">
                        <p className="text-gray-300 text-sm mb-2">Optimal Timing</p>
                        <p className="text-white text-sm">{aiAnalysis.timing.optimal}</p>
                        <p className="text-gray-400 text-xs mt-1">{aiAnalysis.timing.marketWindow}</p>
                      </div>

                      <Button
                        onClick={handleExecute}
                        disabled={aiAnalysis.recommendation.action !== 'EXECUTE'}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        Execute Order
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No AI analysis available</p>
                      <p className="text-gray-500 text-sm mt-2">Click "Analyze with AI" to get insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="execution">
            {executionResult ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Execution Result</CardTitle>
                  <CardDescription className="text-gray-400">Order ID: {executionResult.orderId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Simulation Results */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Expected Profit</p>
                      <p className="text-xl font-bold text-green-400">{executionResult.simulation.expectedProfit}%</p>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Expected Fees</p>
                      <p className="text-xl font-bold text-yellow-400">${executionResult.simulation.expectedFees}</p>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Success Rate</p>
                      <p className="text-xl font-bold text-blue-400">{executionResult.simulation.successRate}%</p>
                    </div>
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Gas Estimate</p>
                      <p className="text-xl font-bold text-purple-400">{executionResult.simulation.gasEstimate.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <Alert className="bg-slate-700 border-slate-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-white">Risk Level: {executionResult.simulation.riskLevel}</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      Transaction prepared and ready for wallet signature
                    </AlertDescription>
                  </Alert>

                  {/* Transaction Details */}
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">To:</span>
                        <span className="text-white font-mono text-xs">{executionResult.transaction.to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="text-white">{executionResult.transaction.value} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gas Price:</span>
                        <span className="text-white">{executionResult.transaction.gasPrice} gwei</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Sign Transaction
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No execution ready</p>
                    <p className="text-gray-500 text-sm mt-2">Complete AI analysis and execute order</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Execution History</CardTitle>
                <CardDescription className="text-gray-400">Recent AI-driven operations</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && metrics.recentExecutions.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.recentExecutions.map((exec, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            exec.profit > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {exec.profit > 0 ? (
                              <TrendingUp className="h-4 w-4 text-white" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{exec.tokenPair}</p>
                            <p className="text-gray-400 text-sm">{new Date(exec.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            exec.profit > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {exec.profit > 0 ? '+' : ''}{exec.profit}%
                          </p>
                          <p className="text-gray-400 text-sm">${exec.fees} fees</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No execution history</p>
                    <p className="text-gray-500 text-sm mt-2">Execute your first AI-driven order</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/ai-execute-orders")({
  component: AIExecuteOrders,
});
                  <div className="rounded-lg bg-slate-700 p-3 text-xs text-gray-300">
                    <span className="font-semibold">Min profit threshold:</span>
                    <span className="ml-1">{(() => { const map: Record<number, number> = { 8453: 0.25, 10: 0.4, 42161: 0.35, 137: 0.3 }; return map[order.chainId] ?? 0.5; })()} USD</span>
                  </div>
