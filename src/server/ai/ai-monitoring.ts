import { aiEngine, AIResponse } from './ai-engine';

// Types for monitoring
export interface AIMetric {
  id: string;
  provider: string;
  operation: string;
  success: boolean;
  latency: number;
  retries: number;
  timestamp: Date;
  error?: string;
  context?: any;
}

export interface AIHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptime: number;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  providers: Record<string, {
    status: 'UP' | 'DOWN';
    successRate: number;
    averageLatency: number;
    lastFailure?: Date;
  }>;
}

// Classe per monitoring AI con persistenza in memoria (per ora)
export class AIMonitoringService {
  private metrics: AIMetric[] = [];
  private readonly MAX_METRICS = 10000; // Limite per evitare memory leak
  private startTime = Date.now();

  recordMetric(metric: AIMetric) {
    this.metrics.push(metric);
    
    // Keep only recent metrics to avoid overflow
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log in tempo reale per debugging
    if (!metric.success) {
      console.error(`[AI-MONITOR] ❌ ${metric.operation} on ${metric.provider} failed:`, metric.error);
    } else {
      console.log(`[AI-MONITOR] ✅ ${metric.operation} on ${metric.provider} completed in ${metric.latency}ms`);
    }
  }

  getHealthStatus(): AIHealthStatus {
    const now = Date.now();
    const recentMetrics = this.getRecentMetrics(24 * 60 * 60 * 1000); // Last 24 hours
    
    const totalRequests = recentMetrics.length;
    const successfulRequests = recentMetrics.filter(m => m.success).length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;
    
    const averageLatency = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.latency, 0) / recentMetrics.length 
      : 0;

    // Calculate statistics for provider
    const providers: AIHealthStatus['providers'] = {};
    const providersList = ['openrouter', 'openai', 'anthropic', 'gemini'];
    
    providersList.forEach(provider => {
      const providerMetrics = recentMetrics.filter(m => m.provider === provider);
      const providerSuccessRate = providerMetrics.length > 0 
        ? (providerMetrics.filter(m => m.success).length / providerMetrics.length) * 100 
        : 0;
      const providerAvgLatency = providerMetrics.length > 0 
        ? providerMetrics.reduce((sum, m) => sum + m.latency, 0) / providerMetrics.length 
        : 0;
      
      const lastFailure = providerMetrics
        .filter(m => !m.success)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp;

      providers[provider] = {
        status: providerSuccessRate >= 80 ? 'UP' : 'DOWN',
        successRate: providerSuccessRate,
        averageLatency: providerAvgLatency,
        lastFailure,
      };
    });

    const criticalProviders = Object.values(providers).filter(p => p.status === 'DOWN').length;
    
    let status: AIHealthStatus['status'] = 'HEALTHY';
    if (criticalProviders >= 3) status = 'CRITICAL';
    else if (criticalProviders >= 2 || successRate < 70) status = 'DEGRADED';

    return {
      status,
      uptime: ((now - this.startTime) / (1000 * 60 * 60 * 24)), // days
      totalRequests,
      successRate,
      averageLatency,
      providers,
    };
  }

  getRecentMetrics(timeWindow: number): AIMetric[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getMetricsByOperation(operation: string): AIMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  getProviderPerformance(provider: string) {
    const providerMetrics = this.metrics.filter(m => m.provider === provider);
    
    if (providerMetrics.length === 0) {
      return { successRate: 0, averageLatency: 0, totalRequests: 0 };
    }

    const successful = providerMetrics.filter(m => m.success).length;
    const totalLatency = providerMetrics.reduce((sum, m) => sum + m.latency, 0);

    return {
      successRate: (successful / providerMetrics.length) * 100,
      averageLatency: totalLatency / providerMetrics.length,
      totalRequests: providerMetrics.length,
    };
  }

  // Alert system to notify critical issues
  checkForCriticalIssues(): string[] {
    const alerts: string[] = [];
    const health = this.getHealthStatus();

    if (health.status === 'CRITICAL') {
      alerts.push('🚨 AI System in CRITICAL state - More than 75% of providers down');
    }

    if (health.successRate < 50) {
      alerts.push(`⚠️ Success rate too low: ${health.successRate.toFixed(1)}%`);
    }

    if (health.averageLatency > 30000) {
      alerts.push(`⏱️ Average latency too high: ${health.averageLatency.toFixed(0)}ms`);
    }

    // Controlla performance individuali dei provider
    Object.entries(health.providers).forEach(([provider, stats]) => {
      if (stats.status === 'DOWN') {
        alerts.push(`🔴 Provider ${provider} DOWN - Success rate: ${stats.successRate.toFixed(1)}%`);
      }
    });

    return alerts;
  }

  // Genera report per la dashboard
  generateReport(): {
    summary: string;
    recommendations: string[];
    charts: any;
  } {
    const health = this.getHealthStatus();
    const alerts = this.checkForCriticalIssues();

    let summary = `📊 **TRUDE AI Report**\n\n`;
    summary += `Status: ${health.status}\n`;
    summary += `Success Rate: ${health.successRate.toFixed(1)}%\n`;
    summary += `Average Latency: ${health.averageLatency.toFixed(0)}ms\n`;
    summary += `Total Requests: ${health.totalRequests}\n`;

    if (alerts.length > 0) {
      summary += `\n🚨 **Active Alerts:**\n`;
      alerts.forEach(alert => summary += `- ${alert}\n`);
    }

    const recommendations: string[] = [];

    if (health.successRate < 90) {
      recommendations.push('Consider increasing timeout for problematic providers');
    }

    if (health.averageLatency > 15000) {
      recommendations.push('Optimize prompts or consider faster models');
    }

    const underperforming = Object.entries(health.providers)
      .filter(([_, stats]) => stats.successRate < 80)
      .map(([provider]) => provider);

    if (underperforming.length > 0) {
      recommendations.push(`Monitor closely providers: ${underperforming.join(', ')}`);
    }

    // Dati per i grafici (placeholder per futuri chart)
    const charts = {
      successRate: this.generateSuccessRateChart(),
      latency: this.generateLatencyChart(),
      providerComparison: this.generateProviderChart(),
    };

    return {
      summary,
      recommendations,
      charts,
    };
  }

  // Metodi helper per generare dati chart
  private generateSuccessRateChart() {
    const hourly = this.getHourlyMetrics();
    return hourly.map(h => ({
      time: h.hour,
      rate: h.metrics.length > 0 ? (h.metrics.filter(m => m.success).length / h.metrics.length) * 100 : 100,
    }));
  }

  private generateLatencyChart() {
    const hourly = this.getHourlyMetrics();
    return hourly.map(h => ({
      time: h.hour,
      latency: h.metrics.length > 0 ? h.metrics.reduce((sum, m) => sum + m.latency, 0) / h.metrics.length : 0,
    }));
  }

  private generateProviderChart() {
    const providers = ['openrouter', 'openai', 'anthropic', 'gemini'];
    return providers.map(provider => ({
      provider,
      ...this.getProviderPerformance(provider),
    }));
  }

  private getHourlyMetrics() {
    const now = Date.now();
    const hours = [];
    
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now - (i * 60 * 60 * 1000));
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const metrics = this.metrics.filter(m => 
        m.timestamp >= hourStart && m.timestamp < hourEnd
      );
      
      hours.push({
        hour: hourStart.toISOString().slice(11, 16), // HH:MM
        metrics,
      });
    }
    
    return hours;
  }
}

// Singleton instance globale
export const aiMonitoring = new AIMonitoringService();

// Wrapper to track all AI calls
export async function trackAIOperation<T>(
  operation: string,
  fn: () => Promise<AIResponse>
): Promise<AIResponse> {
  const startTime = Date.now();
  const id = `${operation}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  try {
    const result = await fn();
    
    const metric: AIMetric = {
      id,
      provider: result.provider,
      operation,
      success: result.success,
      latency: result.latency,
      retries: result.retries,
      timestamp: new Date(),
      error: result.error,
    };
    
    aiMonitoring.recordMetric(metric);
    return result;
    
  } catch (error) {
    const latency = Date.now() - startTime;
    
    const metric: AIMetric = {
      id,
      provider: 'unknown',
      operation,
      success: false,
      latency,
      retries: 0,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    aiMonitoring.recordMetric(metric);
    
    // Ritorna una risposta di fallback strutturata
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      provider: 'unknown',
      latency,
      retries: 0,
      timestamp: new Date().toISOString(),
    };
  }
}