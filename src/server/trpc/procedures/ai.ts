import { z } from 'zod';
import { aiEngine } from '../../ai/ai-engine';
import { aiMonitoring, trackAIOperation } from '../../ai/ai-monitoring';
import { aiTransparencyChat, FinancialQuestionSchema, AIChatResponseSchema } from '../../ai/ai-chat';
import { baseProcedure } from '../main';

// Schema for AI requests
export const AIHealthCheckSchema = z.object({
  detailed: z.boolean().optional().default(false),
});

export const AIFinancialAnalysisSchema = z.object({
  operation: z.enum([
    'DEPOSIT_ANALYSIS',
    'WITHDRAW_ANALYSIS', 
    'VAULT_PERFORMANCE',
    'RISK_ASSESSMENT',
    'PROFIT_PROJECTION',
    'MARKET_TIMING',
    'FEE_OPTIMIZATION',
    'EMERGENCY_EVALUATION'
  ]),
  data: z.record(z.any()),
  vaultId: z.string().optional(),
  userAddress: z.string().optional(),
});

export const AIChatRequestSchema = z.object({
  message: FinancialQuestionSchema,
  conversationId: z.string().optional(),
});

// AI system health check
export const aiHealthCheck = baseProcedure
  .input(AIHealthCheckSchema)
  .output(z.object({
    status: z.enum(['HEALTHY', 'DEGRADED', 'CRITICAL']),
    uptime: z.number(),
    providers: z.record(z.string()),
    metrics: z.object({
      totalRequests: z.number(),
      successRate: z.number(),
      averageLatency: z.number(),
    }).optional(),
    alerts: z.array(z.string()).optional(),
  }))
  .query(async ({ input }) => {
    console.log(`[AI-HEALTH] Checking AI system health...`);
    
    try {
      // Base provider health check
      const healthCheck = await aiEngine.healthCheck();
      
      // Get detailed metrics if requested
      let metrics;
      let alerts: string[] = [];
      
      if (input.detailed) {
        const monitoringHealth = aiMonitoring.getHealthStatus();
        metrics = {
          totalRequests: monitoringHealth.totalRequests,
          successRate: monitoringHealth.successRate,
          averageLatency: monitoringHealth.averageLatency,
        };
        alerts = aiMonitoring.checkForCriticalIssues();
      }

      return {
        status: healthCheck.status as 'HEALTHY' | 'DEGRADED' | 'CRITICAL',
        uptime: input.detailed ? aiMonitoring.getHealthStatus().uptime : 0,
        providers: healthCheck.providers,
        metrics,
        alerts: input.detailed ? alerts : undefined,
      };
      
    } catch (error) {
      console.error('[AI-HEALTH] Error during health check:', error);
      
      return {
        status: 'CRITICAL' as const,
        uptime: 0,
        providers: { error: 'Health check failed' },
        metrics: undefined,
        alerts: ['AI system health check failed'],
      };
    }
  });

// Financial analysis with AI
export const aiFinancialAnalysis = baseProcedure
  .input(AIFinancialAnalysisSchema)
  .output(z.object({
    success: z.boolean(),
    analysis: z.object({
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      expectedProfit: z.number(),
      feasibility: z.boolean(),
      recommendations: z.array(z.string()),
      alerts: z.array(z.string()),
      detailedAnalysis: z.string(),
    }).optional(),
    error: z.string().optional(),
    provider: z.string(),
    latency: z.number(),
    timestamp: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log(`[AI-ANALYSIS] Processing ${input.operation} analysis...`);
    
    return trackAIOperation('financial_analysis', async () => {
      try {
        // Add user context if available
        const enrichedData = {
          ...input.data,
          userAddress: input.userAddress || ctx.user?.address,
          vaultId: input.vaultId,
          timestamp: new Date().toISOString(),
        };

        const result = await aiEngine.analyzeFinancialOperation(
          input.operation,
          enrichedData
        );

        if (!result.success) {
          return {
            success: false,
            analysis: undefined,
            error: result.error || 'Analysis failed',
            provider: result.provider,
            latency: result.latency,
            timestamp: result.timestamp,
            retries: result.retries || 0,
          };
        }

        return {
          success: true,
          analysis: result.data,
          error: undefined,
          provider: result.provider,
          latency: result.latency,
          timestamp: result.timestamp,
          retries: result.retries || 0,
        };
        
      } catch (error) {
        console.error('[AI-ANALYSIS] Error during analysis:', error);
        
        return {
          success: false,
          analysis: undefined,
          error: error instanceof Error ? error.message : 'Analysis error',
          provider: 'unknown',
          latency: 0,
          timestamp: new Date().toISOString(),
          retries: 0,
        };
      }
    });
  });

// AI chat for transparency
export const aiChat = baseProcedure
  .input(AIChatRequestSchema)
  .output(z.object({
    success: z.boolean(),
    data: z.object({
      response: AIChatResponseSchema,
      conversationId: z.string().optional(),
    }).optional(),
    error: z.string().optional(),
    provider: z.string(),
    latency: z.number(),
    timestamp: z.string(),
    retries: z.number(),
  }))
  .mutation(async ({ input }) => {
    console.log(`[AI-CHAT] Processing chat message...`);
    
    return trackAIOperation('financial_chat', async () => {
      try {
        // Validate question for security
        const validation = aiTransparencyChat.validateQuestion(input.message.question);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error || 'Invalid question',
            provider: 'validation',
            latency: 0,
            timestamp: new Date().toISOString(),
            retries: 0,
          };
        }

        // Process financial question
        const response = await aiTransparencyChat.processFinancialQuestion(input.message);
        
        return {
          success: true,
          data: {
            response,
            conversationId: input.conversationId || `chat-${Date.now()}`,
          },
          provider: 'ai-chat',
          latency: 0,
          timestamp: new Date().toISOString(),
          retries: 0,
        };
        
      } catch (error) {
        console.error('[AI-CHAT] Error during chat processing:', error);
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Chat processing error',
          provider: 'ai-chat',
          latency: 0,
          timestamp: new Date().toISOString(),
          retries: 0,
        };
      }
    });
  });

// Endpoint to get common questions
export const aiCommonQuestions = baseProcedure
  .output(z.array(z.object({
    type: z.string(),
    question: z.string(),
    description: z.string(),
  })))
  .query(async () => {
    try {
      return await aiTransparencyChat.getCommonQuestions();
    } catch (error) {
      console.error('[AI-QUESTIONS] Error getting common questions:', error);
      return [];
    }
  });

// AI report for admin dashboard
export const aiReport = baseProcedure
  .output(z.object({
    summary: z.string(),
    recommendations: z.array(z.string()),
    health: z.object({
      status: z.enum(['HEALTHY', 'DEGRADED', 'CRITICAL']),
      uptime: z.number(),
      successRate: z.number(),
      averageLatency: z.number(),
    }),
    alerts: z.array(z.string()),
  }))
  .query(async () => {
    console.log(`[AI-REPORT] Generating AI system report...`);
    
    try {
      const report = aiMonitoring.generateReport();
      const health = aiMonitoring.getHealthStatus();
      const alerts = aiMonitoring.checkForCriticalIssues();
      
      return {
        summary: report.summary,
        recommendations: report.recommendations,
        health: {
          status: health.status,
          uptime: health.uptime,
          successRate: health.successRate,
          averageLatency: health.averageLatency,
        },
        alerts,
      };
      
    } catch (error) {
      console.error('[AI-REPORT] Error generating report:', error);
      
      return {
        summary: "Error generating AI report",
        recommendations: ['Check logs for error details'],
        health: {
          status: 'CRITICAL',
          uptime: 0,
          successRate: 0,
          averageLatency: 0,
        },
        alerts: ['Report generation failed'],
      };
    }
  });