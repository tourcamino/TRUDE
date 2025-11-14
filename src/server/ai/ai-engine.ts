import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

// Configurazione providers con priorità
const AI_PROVIDERS = {
  openrouter: {
    provider: openrouter,
    priority: 1,
    timeout: 30000,
    retries: 3,
    model: 'anthropic/claude-3.5-sonnet',
  },
  openai: {
    provider: openai,
    priority: 2,
    timeout: 25000,
    retries: 2,
    model: 'gpt-4o',
  },
  anthropic: {
    provider: anthropic,
    priority: 3,
    timeout: 25000,
    retries: 2,
    model: 'claude-3-5-sonnet-20241022',
  },
  gemini: {
    provider: google,
    priority: 4,
    timeout: 20000,
    retries: 2,
    model: 'gemini-2.0-flash-exp',
  },
} as const;

type AIProvider = keyof typeof AI_PROVIDERS;
type AIPriority = typeof AI_PROVIDERS[AIProvider]['priority'];

// Schema per la risposta AI con validazione
export const AIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  provider: z.string(),
  latency: z.number(),
  retries: z.number(),
  timestamp: z.string(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// Funzione helper per creare il modello in modo type-safe
function createModel(provider: any, modelName: string) {
  try {
    return provider(modelName);
  } catch (error) {
    console.error(`Error creating model ${modelName}:`, error);
    throw error;
  }
}

// Classe principale per il motore AI
export class AIBulletproofEngine {
  private providers: AIProvider[] = ['openrouter', 'openai', 'anthropic', 'gemini'];
  private attempts = new Map<AIProvider, number>();
  private circuitBreaker = new Map<AIProvider, { failures: number; lastFailure: number }>();
  private readonly MAX_FAILURES = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minuti
  private readonly MAX_MODEL_CALLS = 4; // budget computazionale per richiesta
  private cache = new Map<string, { value: AIResponse; expires: number }>();

  constructor() {
    this.resetAttempts();
  }

  private resetAttempts() {
    this.providers.forEach(provider => {
      this.attempts.set(provider, 0);
    });
  }

  private isCircuitBreakerOpen(provider: AIProvider): boolean {
    const state = this.circuitBreaker.get(provider);
    if (!state) return false;
    
    const timeSinceLastFailure = Date.now() - state.lastFailure;
    return state.failures >= this.MAX_FAILURES && timeSinceLastFailure < this.CIRCUIT_BREAKER_TIMEOUT;
  }

  private recordFailure(provider: AIProvider) {
    const state = this.circuitBreaker.get(provider) || { failures: 0, lastFailure: 0 };
    state.failures++;
    state.lastFailure = Date.now();
    this.circuitBreaker.set(provider, state);
  }

  private recordSuccess(provider: AIProvider) {
    this.circuitBreaker.delete(provider);
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    provider: AIProvider
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout provider ${provider} dopo ${timeout}ms`)), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  async generateTextWithFallback(
    prompt: string,
    options: {
      system?: string;
      maxTokens?: number;
      temperature?: number;
      schema?: z.ZodSchema;
      cacheTTLMs?: number;
    } = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    let totalRetries = 0;
    let callsMade = 0;

    const cacheKey = `${options.system || ''}::${prompt}`;
    const ttl = options.cacheTTLMs ?? 5 * 60 * 1000;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { ...cached.value, latency: Date.now() - startTime };
    }

    // Ordina providers per priorità
    const sortedProviders = this.providers.sort((a, b) => 
      AI_PROVIDERS[a].priority - AI_PROVIDERS[b].priority
    );

    for (const provider of sortedProviders) {
      if (this.isCircuitBreakerOpen(provider)) {
        console.warn(`⚠️ Circuit breaker aperto per ${provider}, saltando...`);
        continue;
      }

      const config = AI_PROVIDERS[provider];
      const attempts = this.attempts.get(provider) || 0;
      
      if (attempts >= config.retries) continue;

      try {
        console.log(`🔄 Tentativo con ${provider} (priorità ${config.priority})...`);
        
        let result: any;
        
        if (options.schema) {
          result = await this.executeWithTimeout(
            generateObject({
              model: createModel(config.provider, config.model),
              system: options.system,
              prompt,
              schema: options.schema,
              maxTokens: options.maxTokens,
              temperature: options.temperature,
            }),
            config.timeout,
            provider
          );
        } else {
          result = await this.executeWithTimeout(
            generateText({
              model: createModel(config.provider, config.model),
              system: options.system,
              prompt,
              maxTokens: options.maxTokens,
              temperature: options.temperature,
            }),
            config.timeout,
            provider
          );
        }

        const latency = Date.now() - startTime;
        this.recordSuccess(provider);
        callsMade++;
        
        console.log(`✅ Successo con ${provider} in ${latency}ms`);
        
        const response: AIResponse = {
          success: true,
          data: options.schema ? result.object : (result as any).text,
          provider,
          latency,
          retries: totalRetries,
          timestamp: new Date().toISOString(),
        };
        this.cache.set(cacheKey, { value: response, expires: Date.now() + ttl });
        return response;

      } catch (error) {
        lastError = error as Error;
        totalRetries++;
        this.attempts.set(provider, attempts + 1);
        this.recordFailure(provider);
        callsMade++;
        
        console.error(`❌ Error ${provider}:`, error);
        
        // Log dettagliato per debugging
        this.logError(provider, error as Error, {
          prompt: prompt.substring(0, 100) + '...',
          attempts: attempts + 1,
        });

        if (callsMade >= this.MAX_MODEL_CALLS) {
          break;
        }
      }
    }

    const latency = Date.now() - startTime;
    
    // Fallback finale: risposta di emergenza
    console.error('🚨 Tutti i provider AI falliti! Usando fallback di emergenza.');
    
    return {
      success: false,
      error: lastError?.message || 'Tutti i provider AI non disponibili',
      provider: 'fallback',
      latency,
      retries: totalRetries,
      timestamp: new Date().toISOString(),
    };
  }

  private logError(provider: AIProvider, error: Error, context: any) {
    // Qui puoi integrare il tuo sistema di logging preferito
    console.error(`[AI-ERROR] ${provider}:`, {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Metodo per analisi finanziarie specifiche di TRUDE
  async analyzeFinancialOperation(
    operation: string,
    data: any
  ): Promise<AIResponse> {
    const systemPrompt = `Sei un esperto di finanza DeFi per TRUDE. Analizza operazioni finanziarie con precisione millimetrica.
    
REQUISITI CRITICI:
- ZERO errori di calcolo
- Massima trasparenza
- Spiega ogni step
- Verifica i dati forniti
- Segnala potenziali rischi

CONTEXTO TRUDE:
- Protocollo DeFi con vault automatizzati
- Target profitto: ~1% giornaliero
- Gestione rischi automatica
- Trasparenza totale richiesta`;

    const prompt = `
Analizza questa operazione finanziaria per TRUDE:

Tipo Operazione: ${operation}
Dati: ${JSON.stringify(data, null, 2)}

Fornisci:
1. Analisi dettagliata dei rischi
2. Calcolo profitto atteso
3. Verifica fattibilità
4. Raccomandazioni
5. Alert su potenziali problemi

RISPONDA IN FORMATO JSON STRUTTURATO.`;

    const FinancialAnalysisSchema = z.object({
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      expectedProfit: z.number(),
      feasibility: z.boolean(),
      recommendations: z.array(z.string()),
      alerts: z.array(z.string()),
      detailedAnalysis: z.string(),
    });

    return this.generateTextWithFallback(prompt, {
      system: systemPrompt,
      schema: FinancialAnalysisSchema,
      temperature: 0.1, // Bassa temperatura per massima precisione
    });
  }

  // Health check per il sistema AI
  async healthCheck(): Promise<{ status: string; providers: Record<string, string> }> {
    const results: Record<string, string> = {};
    
    for (const provider of this.providers) {
      try {
        const start = Date.now();
        await this.executeWithTimeout(
          generateText({
            model: createModel(AI_PROVIDERS[provider].provider, AI_PROVIDERS[provider].model),
            prompt: 'Test: rispondi solo "OK"',
            maxTokens: 10,
          }),
          10000,
          provider
        );
        
        results[provider] = `✅ OK (${Date.now() - start}ms)`;
      } catch (error) {
        results[provider] = `❌ ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    const allHealthy = Object.values(results).every(status => status.includes('✅'));
    
    return {
      status: allHealthy ? 'HEALTHY' : 'DEGRADED',
      providers: results,
    };
  }
}

// Singleton instance
export const aiEngine = new AIBulletproofEngine();