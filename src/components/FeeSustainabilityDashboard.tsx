// Dashboard per analizzare la sostenibilità del modello fee
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getSustainabilityMetrics } from '@/utils/fee-sustainability-analysis';

export function FeeSustainabilityDashboard() {
  const metrics = getSustainabilityMetrics();
  
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Principale */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">
              📊 Modello Fee: 10-30% Performance + 0% Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  ${metrics.current.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Ricavo Mensile</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.current.userCount}
                </div>
                <div className="text-sm text-gray-600">Utenti Stimati</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {(metrics.current.performanceFeeRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Fee Rate Attuale</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {metrics.current.sustainabilityScore}/10
                </div>
                <div className="text-sm text-gray-600">Score Sostenibilità</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analisi Scenari */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>📈 Analisi Scenari Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.scenarios).map(([scenario, data]) => (
                <div key={scenario} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant={getScenarioColor(scenario)}>
                      {scenario.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {data.dailyProfitTarget.toFixed(1)}% daily profit
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${data.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Monthly Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {(data.performanceFeeRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Fee Rate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {data.sustainabilityScore}/10
                      </div>
                      <Progress value={data.sustainabilityScore * 10} className="w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Confronto Competitors */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>⚔️ Confronto Competitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* TRUDE */}
              <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-green-600">TRUDE</div>
                  <Badge variant="success" className="mt-1">WINNER</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Performance Fee:</span>
                    <span className="font-semibold">10-30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdrawal Fee:</span>
                    <span className="font-semibold text-green-600">0% 🎯</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total Cost:</span>
                    <span className="font-bold text-green-600">
                      ${metrics.comparison.trude.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Competitors */}
              {Object.entries(metrics.comparison.competitors).map(([name, data]) => (
                <div key={name} className="p-4 border rounded-lg">
                  <div className="text-center mb-3">
                    <div className="text-lg font-bold text-gray-700">{name.toUpperCase()}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Performance Fee:</span>
                      <span className="font-semibold">{(data.performanceFee / 10000 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Withdrawal Fee:</span>
                      <span className="font-semibold">
                        {(data.withdrawFee / 10000 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total Cost:</span>
                      <span className="font-bold text-red-600">
                        ${data.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Raccomandazioni */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>💡 Raccomandazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600">✅ Vantaggi Competitivi</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500">•</span>
                    <span>Zero barriere d'ingresso (0% deposit/withdraw)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500">•</span>
                    <span>Fee performance dinamiche e competitive</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500">•</span>
                    <span>Modello altamente sostenibile con AUM &gt;$300k</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500">•</span>
                    <span>Score sostenibilità 7-9/10 in scenari realistici</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-yellow-600">⚠️ Considerazioni</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500">•</span>
                    <span>Necessario AUM minimo $300k per break-even</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500">•</span>
                    <span>Performance &lt;0.8% daily riduce sostenibilità</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500">•</span>
                    <span>Focus critico su marketing per raggiungere AUM target</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getScenarioColor(scenario: string): "default" | "secondary" | "destructive" | "outline" {
  switch (scenario) {
    case 'bearish': return 'destructive';
    case 'conservative': return 'secondary';
    case 'target': return 'default';
    case 'optimistic': return 'outline';
    case 'bullish': return 'default';
    default: return 'default';
  }
}