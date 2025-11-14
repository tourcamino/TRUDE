import { EventEmitter } from 'events';
import { TruDeErrorHandling, ErrorCategory, ErrorSeverity } from '../error-handling/TruDeErrorHandling';
import { TruDeSupplyChainAdapter } from '../supply-chain/TruDeSupplyChainAdapter';
import { TruDePythOracle } from '../oracle/TruDePythOracle';
import { Logger } from '../utils/Logger';

export interface AlertConfig {
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'sms' | 'webhook' | 'dashboard' | 'telegram')[];
  cooldown: number; // seconds
  escalationDelay: number; // seconds
  maxEscalations: number;
}

export interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains';
  threshold: number | string;
  duration: number; // seconds
  alertConfig: AlertConfig;
  enabled: boolean;
  tags: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  context: Record<string, any>;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  acknowledgedBy?: string;
  resolvedAt?: Date;
  escalatedAt?: Date;
  escalationLevel: number;
  channelsTriggered: string[];
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    oracle: 'healthy' | 'degraded' | 'critical';
    adapter: 'healthy' | 'degraded' | 'critical';
    messaging: 'healthy' | 'degraded' | 'critical';
    security: 'healthy' | 'degraded' | 'critical';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
    activeAlerts: number;
  };
  lastCheck: Date;
}

export class TruDeMonitoringSystem extends EventEmitter {
  private rules: Map<string, MonitoringRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private activeAlerts: Set<string> = new Set();
  private alertHistory: Alert[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsCollectionInterval: NodeJS.Timeout | null = null;
  private logger: Logger;
  private errorHandler: TruDeErrorHandling;
  private adapter: TruDeSupplyChainAdapter;
  private oracle: TruDePythOracle;
  
  private readonly MAX_HISTORY_SIZE = 10000;
  private readonly DEFAULT_COOLDOWN = 300; // 5 minutes
  private readonly SYSTEM_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly METRICS_COLLECTION_INTERVAL = 10000; // 10 seconds

  constructor() {
    super();
    this.logger = new Logger('TruDeMonitoringSystem');
    this.errorHandler = new TruDeErrorHandling();
    this.adapter = new TruDeSupplyChainAdapter();
    this.oracle = new TruDePythOracle();
    
    this.initializeDefaultRules();
    this.startHealthMonitoring();
    this.startMetricsCollection();
  }

  // Premium monitoring rules for critical operations
  private initializeDefaultRules(): void {
    const defaultRules: MonitoringRule[] = [
      // Oracle Health Monitoring
      {
        id: 'oracle_health_critical',
        name: 'Oracle Health Critical',
        description: 'Pyth oracle is not responding or returning stale data',
        metric: 'oracle.health',
        condition: 'equals',
        threshold: 'critical',
        duration: 60,
        alertConfig: {
          enabled: true,
          severity: 'critical',
          channels: ['email', 'sms', 'webhook', 'telegram'],
          cooldown: 300,
          escalationDelay: 600,
          maxEscalations: 3
        },
        enabled: true,
        tags: ['oracle', 'critical', 'supply-chain']
      },
      
      // Transaction Success Rate
      {
        id: 'transaction_success_rate',
        name: 'Transaction Success Rate Low',
        description: 'Transaction success rate has dropped below acceptable threshold',
        metric: 'adapter.success_rate',
        condition: 'less_than',
        threshold: 95,
        duration: 300,
        alertConfig: {
          enabled: true,
          severity: 'high',
          channels: ['email', 'webhook', 'dashboard'],
          cooldown: 600,
          escalationDelay: 1200,
          maxEscalations: 2
        },
        enabled: true,
        tags: ['transactions', 'performance', 'supply-chain']
      },
      
      // Response Time Monitoring
      {
        id: 'response_time_high',
        name: 'Response Time High',
        description: 'System response time has exceeded acceptable threshold',
        metric: 'adapter.latency',
        condition: 'greater_than',
        threshold: 5000,
        duration: 180,
        alertConfig: {
          enabled: true,
          severity: 'medium',
          channels: ['email', 'webhook', 'dashboard'],
          cooldown: 900,
          escalationDelay: 1800,
          maxEscalations: 1
        },
        enabled: true,
        tags: ['performance', 'latency', 'user-experience']
      },
      
      // Error Rate Monitoring
      {
        id: 'error_rate_high',
        name: 'Error Rate High',
        description: 'System error rate has exceeded acceptable threshold',
        metric: 'adapter.error_rate',
        condition: 'greater_than',
        threshold: 5,
        duration: 300,
        alertConfig: {
          enabled: true,
          severity: 'high',
          channels: ['email', 'webhook', 'telegram'],
          cooldown: 600,
          escalationDelay: 1200,
          maxEscalations: 2
        },
        enabled: true,
        tags: ['errors', 'reliability', 'system-health']
      },
      
      // Arbitrage Opportunity Detection
      {
        id: 'arbitrage_opportunity_large',
        name: 'Large Arbitrage Opportunity',
        description: 'Significant arbitrage opportunity detected',
        metric: 'arbitrage.spread',
        condition: 'greater_than',
        threshold: 2.0,
        duration: 30,
        alertConfig: {
          enabled: true,
          severity: 'medium',
          channels: ['webhook', 'telegram', 'dashboard'],
          cooldown: 60,
          escalationDelay: 300,
          maxEscalations: 1
        },
        enabled: true,
        tags: ['arbitrage', 'opportunity', 'profit']
      },
      
      // Memory Usage Monitoring
      {
        id: 'memory_usage_high',
        name: 'Memory Usage High',
        description: 'System memory usage has exceeded threshold',
        metric: 'system.memory_usage',
        condition: 'greater_than',
        threshold: 80,
        duration: 300,
        alertConfig: {
          enabled: true,
          severity: 'medium',
          channels: ['email', 'webhook'],
          cooldown: 900,
          escalationDelay: 1800,
          maxEscalations: 2
        },
        enabled: true,
        tags: ['memory', 'resources', 'performance']
      },
      
      // Security Breach Detection
      {
        id: 'security_breach_critical',
        name: 'Security Breach Critical',
        description: 'Potential security breach detected',
        metric: 'security.threat_level',
        condition: 'greater_than',
        threshold: 7,
        duration: 0,
        alertConfig: {
          enabled: true,
          severity: 'critical',
          channels: ['email', 'sms', 'webhook', 'telegram'],
          cooldown: 60,
          escalationDelay: 300,
          maxEscalations: 5
        },
        enabled: true,
        tags: ['security', 'breach', 'critical']
      },
      
      // Queue Size Monitoring
      {
        id: 'queue_size_high',
        name: 'Queue Size High',
        description: 'Transaction queue size has exceeded threshold',
        metric: 'adapter.queue_size',
        condition: 'greater_than',
        threshold: 500,
        duration: 180,
        alertConfig: {
          enabled: true,
          severity: 'medium',
          channels: ['webhook', 'dashboard'],
          cooldown: 600,
          escalationDelay: 1200,
          maxEscalations: 1
        },
        enabled: true,
        tags: ['queue', 'performance', 'capacity']
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  // Premium rule management
  addRule(rule: MonitoringRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info(`Monitoring rule added: ${rule.name}`, { ruleId: rule.id });
  }

  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.logger.info(`Monitoring rule removed: ${ruleId}`);
    }
    return removed;
  }

  updateRule(ruleId: string, updates: Partial<MonitoringRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    
    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);
    this.logger.info(`Monitoring rule updated: ${ruleId}`);
    return true;
  }

  // Premium metric collection and evaluation
  private async startMetricsCollection(): Promise<void> {
    this.metricsCollectionInterval = setInterval(async () => {
      await this.collectAndEvaluateMetrics();
    }, this.METRICS_COLLECTION_INTERVAL);
  }

  private async collectAndEvaluateMetrics(): Promise<void> {
    try {
      const metrics = await this.collectSystemMetrics();
      
      for (const [ruleId, rule] of this.rules) {
        if (!rule.enabled) continue;
        
        const metricValue = this.getMetricValue(metrics, rule.metric);
        if (metricValue === null) continue;
        
        const shouldAlert = this.evaluateRule(rule, metricValue);
        
        if (shouldAlert) {
          await this.triggerAlert(rule, metricValue, metrics);
        }
      }
    } catch (error) {
      this.logger.error('Error during metrics collection', { error });
    }
  }

  private async collectSystemMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};
    
    try {
      // Collect adapter metrics
      const adapterMetrics = this.adapter.getMetrics();
      metrics['adapter.success_rate'] = adapterMetrics.successRate;
      metrics['adapter.latency'] = adapterMetrics.latency;
      metrics['adapter.error_rate'] = adapterMetrics.errorRate;
      metrics['adapter.queue_size'] = adapterMetrics.queueSize;
      metrics['adapter.throughput'] = adapterMetrics.throughput;
      
      // Collect oracle metrics
      const oracleHealth = this.oracle.isOracleHealthy();
      metrics['oracle.health'] = oracleHealth ? 'healthy' : 'critical';
      
      // Collect system metrics
      const memoryUsage = process.memoryUsage();
      metrics['system.memory_usage'] = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      // Collect security metrics (simulated)
      metrics['security.threat_level'] = Math.random() * 10; // 0-10 scale
      
      // Collect arbitrage metrics
      const arbitrageOpportunities = await this.detectArbitrageOpportunities();
      if (arbitrageOpportunities.length > 0) {
        metrics['arbitrage.spread'] = Math.max(...arbitrageOpportunities.map(opp => opp.spread));
      }
      
    } catch (error) {
      this.logger.error('Error collecting system metrics', { error });
    }
    
    return metrics;
  }

  private getMetricValue(metrics: Record<string, any>, metricPath: string): any {
    return metrics[metricPath] ?? null;
  }

  private evaluateRule(rule: MonitoringRule, value: any): boolean {
    switch (rule.condition) {
      case 'greater_than':
        return Number(value) > Number(rule.threshold);
      case 'less_than':
        return Number(value) < Number(rule.threshold);
      case 'equals':
        return value === rule.threshold;
      case 'not_equals':
        return value !== rule.threshold;
      case 'contains':
        return String(value).includes(String(rule.threshold));
      default:
        return false;
    }
  }

  // Premium alert triggering and management
  private async triggerAlert(rule: MonitoringRule, value: any, context: Record<string, any>): Promise<void> {
    // Check cooldown
    const recentAlert = this.getRecentAlert(rule.id);
    if (recentAlert && (Date.now() - recentAlert.timestamp.getTime()) < rule.alertConfig.cooldown * 1000) {
      return;
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      severity: rule.alertConfig.severity,
      title: rule.name,
      message: `${rule.description}. Current value: ${value}, Threshold: ${rule.threshold}`,
      context: {
        ...context,
        metricValue: value,
        threshold: rule.threshold,
        ruleName: rule.name
      },
      timestamp: new Date(),
      status: 'active',
      escalationLevel: 0,
      channelsTriggered: []
    };

    // Send alert through configured channels
    await this.sendAlert(alert, rule.alertConfig.channels);
    
    // Store alert
    this.alerts.set(alert.id, alert);
    this.activeAlerts.add(alert.id);
    this.alertHistory.push(alert);
    
    // Maintain history size
    if (this.alertHistory.length > this.MAX_HISTORY_SIZE) {
      this.alertHistory.shift();
    }

    this.logger.warn(`Alert triggered: ${alert.title}`, {
      alertId: alert.id,
      severity: alert.severity,
      ruleId: rule.id,
      value
    });

    this.emit('alertTriggered', alert);
  }

  private async sendAlert(alert: Alert, channels: string[]): Promise<void> {
    const promises = channels.map(channel => this.sendAlertThroughChannel(alert, channel));
    await Promise.allSettled(promises);
    alert.channelsTriggered = channels;
  }

  private async sendAlertThroughChannel(alert: Alert, channel: string): Promise<void> {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'sms':
          await this.sendSMSAlert(alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert);
          break;
        case 'telegram':
          await this.sendTelegramAlert(alert);
          break;
        case 'dashboard':
          // Dashboard alerts are handled by the UI
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to send alert through ${channel}`, { error, alertId: alert.id });
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    // Simulate email sending
    this.logger.info(`Email alert sent`, {
      alertId: alert.id,
      to: 'admin@trude.com',
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`
    });
  }

  private async sendSMSAlert(alert: Alert): Promise<void> {
    // Simulate SMS sending
    this.logger.info(`SMS alert sent`, {
      alertId: alert.id,
      to: '+1234567890',
      message: alert.message
    });
  }

  private async sendWebhookAlert(alert: Alert): Promise<void> {
    try {
      const response = await fetch('https://api.trude.com/alerts/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_API_KEY}`
        },
        body: JSON.stringify({
          alertId: alert.id,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          context: alert.context,
          timestamp: alert.timestamp.toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
      
      this.logger.info(`Webhook alert sent successfully`, { alertId: alert.id });
    } catch (error) {
      this.logger.error(`Webhook alert failed`, { error, alertId: alert.id });
    }
  }

  private async sendTelegramAlert(alert: Alert): Promise<void> {
    // Simulate Telegram notification
    this.logger.info(`Telegram alert sent`, {
      alertId: alert.id,
      chatId: '@trude_alerts',
      message: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}\n\n${alert.message}`
    });
  }

  // Premium alert management
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status !== 'active') return false;
    
    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    
    this.logger.info(`Alert acknowledged`, { alertId, acknowledgedBy });
    this.emit('alertAcknowledged', alert);
    return true;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || (alert.status !== 'active' && alert.status !== 'acknowledged')) return false;
    
    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    this.activeAlerts.delete(alertId);
    
    this.logger.info(`Alert resolved`, { alertId });
    this.emit('alertResolved', alert);
    return true;
  }

  escalateAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status === 'resolved') return false;
    
    const rule = this.rules.get(alert.ruleId);
    if (!rule) return false;
    
    if (alert.escalationLevel >= rule.alertConfig.maxEscalations) {
      this.logger.warn(`Max escalations reached for alert`, { alertId });
      return false;
    }
    
    alert.escalationLevel++;
    alert.escalatedAt = new Date();
    
    // Resend alert with higher priority
    this.sendAlert(alert, rule.alertConfig.channels);
    
    this.logger.info(`Alert escalated`, { 
      alertId, 
      escalationLevel: alert.escalationLevel,
      maxEscalations: rule.alertConfig.maxEscalations 
    });
    
    this.emit('alertEscalated', alert);
    return true;
  }

  // Premium health monitoring
  private async startHealthMonitoring(): Promise<void> {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.SYSTEM_HEALTH_CHECK_INTERVAL);
  }

  private async performHealthCheck(): Promise<SystemHealth> {
    const health: SystemHealth = {
      overall: 'healthy',
      components: {
        oracle: 'healthy',
        adapter: 'healthy',
        messaging: 'healthy',
        security: 'healthy'
      },
      metrics: {
        uptime: this.calculateUptime(),
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        activeAlerts: this.activeAlerts.size
      },
      lastCheck: new Date()
    };

    try {
      // Check oracle health
      const oracleHealthy = this.oracle.isOracleHealthy();
      health.components.oracle = oracleHealthy ? 'healthy' : 'critical';
      
      // Check adapter health
      const adapterStatus = this.adapter.getSystemStatus();
      health.components.adapter = adapterStatus.status as 'healthy' | 'degraded' | 'critical';
      health.metrics.responseTime = adapterStatus.metrics.latency;
      health.metrics.errorRate = adapterStatus.metrics.errorRate;
      health.metrics.throughput = adapterStatus.metrics.throughput;
      
      // Check error handler health
      const errorMetrics = this.errorHandler.getHealthStatus();
      const hasCriticalErrors = Array.from(errorMetrics.values())
        .some(status => status.status === 'unhealthy');
      health.components.security = hasCriticalErrors ? 'critical' : 'healthy';
      
      // Determine overall health
      const componentStatuses = Object.values(health.components);
      if (componentStatuses.includes('critical')) {
        health.overall = 'critical';
      } else if (componentStatuses.includes('degraded')) {
        health.overall = 'degraded';
      }
      
    } catch (error) {
      health.overall = 'critical';
      this.logger.error('Health check failed', { error });
    }

    this.emit('healthCheckCompleted', health);
    return health;
  }

  private calculateUptime(): number {
    // Simplified uptime calculation
    const recentAlerts = this.alertHistory.filter(alert => 
      alert.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
      alert.severity === 'critical'
    );
    
    const uptime = Math.max(0, 100 - (recentAlerts.length * 2)); // 2% per critical alert
    return Math.min(100, uptime);
  }

  // Premium arbitrage opportunity detection
  private async detectArbitrageOpportunities(): Promise<any[]> {
    // Simulate arbitrage detection
    const opportunities = [];
    
    if (Math.random() > 0.7) { // 30% chance of opportunity
      opportunities.push({
        spread: Math.random() * 5, // 0-5% spread
        fromNetwork: 'ethereum',
        toNetwork: 'polygon',
        commodity: 'gold',
        confidence: Math.random()
      });
    }
    
    return opportunities;
  }

  // Premium utility methods
  private getRecentAlert(ruleId: string): Alert | undefined {
    return this.alertHistory
      .filter(alert => alert.ruleId === ruleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  // Premium getters and reporting
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts).map(id => this.alerts.get(id)).filter(Boolean);
  }

  getAlertHistory(limit?: number): Alert[] {
    const history = [...this.alertHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? history.slice(0, limit) : history;
  }

  getRules(): MonitoringRule[] {
    return Array.from(this.rules.values());
  }

  getRulesByTag(tag: string): MonitoringRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.tags.includes(tag));
  }

  getSystemHealth(): Promise<SystemHealth> {
    return this.performHealthCheck();
  }

  // Premium reporting
  generateMonitoringReport(): {
    summary: {
      totalAlerts: number;
      activeAlerts: number;
      criticalAlerts: number;
      highAlerts: number;
      systemHealth: string;
      uptime: number;
    };
    topAlerts: Alert[];
    rulesStatus: Array<{
      ruleId: string;
      ruleName: string;
      enabled: boolean;
      alertCount: number;
      lastTriggered?: Date;
    }>;
    healthTrend: Array<{
      timestamp: Date;
      health: string;
      activeAlerts: number;
    }>;
    recommendations: string[];
  } {
    const activeAlerts = this.getActiveAlerts();
    const recentAlerts = this.getAlertHistory(100);
    
    const summary = {
      totalAlerts: this.alertHistory.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
      highAlerts: activeAlerts.filter(a => a.severity === 'high').length,
      systemHealth: 'healthy',
      uptime: this.calculateUptime()
    };

    const topAlerts = recentAlerts
      .filter(alert => ['critical', 'high'].includes(alert.severity))
      .slice(0, 10);

    const rulesStatus = Array.from(this.rules.values()).map(rule => {
      const ruleAlerts = this.alertHistory.filter(alert => alert.ruleId === rule.id);
      const lastTriggered = ruleAlerts.length > 0 ? ruleAlerts[ruleAlerts.length - 1].timestamp : undefined;
      
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        enabled: rule.enabled,
        alertCount: ruleAlerts.length,
        lastTriggered
      };
    });

    const healthTrend = this.generateHealthTrend();
    const recommendations = this.generateMonitoringRecommendations(summary, activeAlerts);

    return {
      summary,
      topAlerts,
      rulesStatus,
      healthTrend,
      recommendations
    };
  }

  private generateHealthTrend(): Array<{ timestamp: Date; health: string; activeAlerts: number }> {
    // Generate mock health trend data
    const trend = [];
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - (i * 60 * 60 * 1000));
      const health = ['healthy', 'degraded', 'critical'][Math.floor(Math.random() * 3)];
      const activeAlerts = Math.floor(Math.random() * 10);
      
      trend.push({ timestamp, health, activeAlerts });
    }
    
    return trend;
  }

  private generateMonitoringRecommendations(summary: any, activeAlerts: Alert[]): string[] {
    const recommendations = [];
    
    if (summary.criticalAlerts > 0) {
      recommendations.push('Immediate attention required: Critical alerts are active');
      recommendations.push('Review system logs and error reports for root cause analysis');
    }
    
    if (summary.highAlerts > 3) {
      recommendations.push('Multiple high-severity alerts detected - investigate system stability');
    }
    
    if (summary.uptime < 95) {
      recommendations.push('System uptime is below target - implement redundancy measures');
    }
    
    if (activeAlerts.length > 10) {
      recommendations.push('High number of active alerts - consider alert fatigue mitigation');
    }
    
    return recommendations;
  }

  // Cleanup
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }
    
    this.logger.info('Monitoring system stopped');
  }
}

export default TruDeMonitoringSystem;