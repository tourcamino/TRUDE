import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Activity, Server, Zap, Shield } from 'lucide-react';
import { api } from '@/trpc/react';
import { toast } from 'react-hot-toast';

interface ProviderStatus {
  status: 'UP' | 'DOWN';
  successRate: number;
  averageLatency: number;
  lastFailure?: Date;
}

interface AIHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptime: number;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  providers: Record<string, ProviderStatus>;
}

export function AIStatusDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Queries con refetch automatico
  const { data: healthData, refetch: refetchHealth, isLoading } = api.aiHealthCheck.useQuery(
    { detailed: true },
    { 
      refetchInterval: autoRefresh ? 30000 : false, // 30 secondi
      onError: (error) => {
        toast.error(`Error loading AI status: ${error.message}`);
      }
    }
  );

  const { data: aiReport } = api.aiReport.useQuery(undefined, {
    refetchInterval: autoRefresh ? 60000 : false, // 1 minuto
  });

  useEffect(() => {
    if (healthData) {
      setLastUpdate(new Date());
    }
  }, [healthData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      case 'DEGRADED': return 'text-yellow-600 bg-yellow-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'UP': return 'text-green-600';
      case 'DOWN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'DEGRADED': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'CRITICAL': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatUptime = (days: number) => {
    if (days < 1) return `${(days * 24).toFixed(1)} ore`;
    return `${days.toFixed(1)} giorni`;
  };

  const handleManualRefresh = () => {
    refetchHealth();
    toast.success('AI status updated');
  };

  if (isLoading && !healthData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>Caricamento stato AI...</span>
          </div>
        </div>
      </Card>
    );
  }

  const health = healthData as AIHealthStatus;

  return (
    <div className="space-y-6">
      {/* Header con controlli */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            AI System Status
          </h2>
          <p className="text-gray-600">Monitoraggio in tempo reale del motore AI Zero-Error</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-1" />
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 mr-1" />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stato Sistema</p>
              <p className={`text-lg font-semibold ${getStatusColor(health.status)}`}>
                {health.status}
              </p>
            </div>
            {getStatusIcon(health.status)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {health.successRate.toFixed(1)}%
              </p>
            </div>
            {health.successRate >= 95 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Latenza Media</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatLatency(health.averageLatency)}
              </p>
            </div>
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatUptime(health.uptime)}
              </p>
            </div>
            <Clock className="h-5 w-5 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Provider Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="h-5 w-5" />
          Provider AI Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(health.providers).map(([provider, stats]) => (
            <div key={provider} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{provider}</h4>
                <Badge className={stats.status === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {stats.status}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className={stats.successRate >= 80 ? 'text-green-600' : 'text-red-600'}>
                    {stats.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Latenza:</span>
                  <span>{formatLatency(stats.averageLatency)}</span>
                </div>
                {stats.lastFailure && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ultimo errore:</span>
                    <span className="text-xs text-red-600">
                      {new Date(stats.lastFailure).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alerts */}
      {aiReport?.alerts && aiReport.alerts.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alert Attivi
          </h3>
          <div className="space-y-2">
            {aiReport.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-white rounded border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-800">{alert}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {aiReport?.recommendations && aiReport.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Raccomandazioni
          </h3>
          <div className="space-y-2">
            {aiReport.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-800">{rec}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-center text-sm text-gray-500">
          Ultimo aggiornamento: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}