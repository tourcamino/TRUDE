import { aiEngine } from './ai-engine';
import { trackAIOperation } from './ai-monitoring';
import { z } from 'zod';

// Schema per le domande finanziarie
export const FinancialQuestionSchema = z.object({
  type: z.enum([
    'VAULT_PERFORMANCE',
    'RISK_ANALYSIS', 
    'PROFIT_CALCULATION',
    'TRANSPARENCY_REQUEST',
    'STRATEGY_EXPLANATION',
    'FEE_ANALYSIS',
    'MARKET_CONDITIONS',
    'EMERGENCY_INFO'
  ]),
  question: z.string().min(10).max(1000),
  context: z.object({
    vaultId: z.string().optional(),
    userAddress: z.string().optional(),
    timeframe: z.enum(['1D', '7D', '30D', 'ALL']).optional(),
    includeRawData: z.boolean().optional(),
  }).optional(),
});

export type FinancialQuestion = z.infer<typeof FinancialQuestionSchema>;

// Schema per la risposta
export const AIChatResponseSchema = z.object({
  answer: z.string(),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  sources: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
  rawData: z.any().optional(),
  followUpQuestions: z.array(z.string()).optional(),
  timestamp: z.string(),
});

export type AIChatResponse = z.infer<typeof AIChatResponseSchema>;

// Sistema di chat AI per trasparenza finanziaria
export class AITransparencyChat {
  
  async processFinancialQuestion(question: FinancialQuestion): Promise<AIChatResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(question.type);
      const userPrompt = this.buildUserPrompt(question);
      
      const response = await aiEngine.generateTextWithFallback(userPrompt, {
        system: systemPrompt,
        temperature: 0.2, // Bassa per massima accuratezza
        maxTokens: 2000,
      });

      if (!response.success) {
        return {
          answer: "Sorry, I couldn't process your financial request. Please try again in a few seconds.",
          confidence: 'LOW',
          sources: [],
          warnings: ['Sistema AI temporaneamente non disponibile'],
          timestamp: new Date().toISOString(),
        };
      }

      // Valida e struttura la risposta
      return this.validateAndStructureResponse(response.data, question);
      
    } catch (error) {
      console.error('Financial AI chat error:', error);
      return {
        answer: "An error occurred while processing your request. The technical team has been notified.",
        confidence: 'LOW',
        sources: [],
        warnings: ['Temporary system error'],
        timestamp: new Date().toISOString(),
      };
    }
  }

  private buildSystemPrompt(type: FinancialQuestion['type']): string {
    const basePrompt = `Sei TRUDE-AI, un assistente finanziario DeFi ultra-specializzato per TRUDE Protocol.

REQUISITI CRITICI:
- TRASPARENZA TOTALE: Spiega sempre come calcoli i numeri
- ZERO CONFLITTI DI INTERESSE: Sei imparziale e onesto
- MASSIMA PRECISIONE: I tuoi calcoli devono essere perfetti
- SICUREZZA PRIMA: Avvisa sempre sui rischi

CONTEXTO TRUDE:
- Protocollo DeFi con vault automatizzati
- Obiettivo: ~1% profitto giornaliero in condizioni favorevoli
- Gestione rischi: Automatica con parametri di sicurezza
- Blockchain: Multi-chain support

REGOLE COMUNICAZIONE:
- Usa italiano chiaro e diretto
- Fornisci sempre i numeri reali quando possibile
- Spiega i rischi in modo trasparente
- Dai fonti e calcoli quando richiesto
- Se non sei sicuro, dillo chiaramente`;

    const typeSpecificPrompts = {
      VAULT_PERFORMANCE: `
SPECIALIZZAZIONE: Analisi performance vault TRUDE
- Calcola APY, ROI, e metriche di performance
- Confronta con benchmark del mercato
- Analizza volatilità e drawdown
- Spiega strategie di reinvestimento`,

      RISK_ANALYSIS: `
SPECIALIZZAZIONE: Analisi rischi finanziari
- Identifica tutti i rischi possibili (smart contract, mercato, liquidità)
- Calcola probabilità di perdita
- Analizza correlazioni e black swan events
- Fornisci raccomandazioni di risk management`,

      PROFIT_CALCULATION: `
SPECIALIZZAZIONE: Calcoli profitto e tassazione
- Calcola profitto netto e lordo
- Considera fees e slippage
- Analizza impatto fiscale
- Fornisci proiezioni realistiche`,

      TRANSPARENCY_REQUEST: `
SPECIALIZZAZIONE: Richieste trasparenza
- Fornisci tutti i dati richiesti
- Spiega ogni transazione e fee
- Mostra calcoli passo-passo
- Link a blockchain explorer quando possibile`,

      STRATEGY_EXPLANATION: `
SPECIALIZZAZIONE: Spiegazione strategie
- Dettaglia strategie di investimento attive
- Spiega algoritmi e parametri
- Analizza performance storica
- Confronta con alternative di mercato`,

      FEE_ANALYSIS: `
SPECIALIZZAZIONE: Analisi costi e fees
- Dettaglia tutte le fees (gas, protocollo, performance)
- Calcola impatto su ROI
- Confronta fees con competitors
- Suggerimenti per minimizzare costi`,

      MARKET_CONDITIONS: `
SPECIALIZZAZIONE: Analisi condizioni di mercato
- Valuta opportunità di mercato attuali
- Analizza volatilità e trend
- Identifica migliori momenti per entrare/uscire
- Considera macro-fattori`,

      EMERGENCY_INFO: `
SPECIALIZZAZIONE: Informazioni di emergenza
- Fornisci procedure di emergenza
- Spiega come proteggere fondi
- Dettaglia meccanismi di sicurezza
- Dai istruzioni chiare per situazioni critiche`,
    };

    return basePrompt + (typeSpecificPrompts[type] || '');
  }

  private buildUserPrompt(question: FinancialQuestion): string {
    const { type, question: userQuestion, context } = question;
    
    let prompt = `TIPO RICHIESTA: ${type}

DOMANDA DELL'UTENTE:
${userQuestion}

`;

    if (context) {
      prompt += `CONTESTO AGGIUNTIVO:
`;
      if (context.vaultId) prompt += `- Vault ID: ${context.vaultId}\n`;
      if (context.userAddress) prompt += `- Indirizzo Utente: ${context.userAddress}\n`;
      if (context.timeframe) prompt += `- Periodo: ${context.timeframe}\n`;
      if (context.includeRawData) prompt += `- Include dati raw: Sì\n`;
    }

    prompt += `

ISTRUZIONI:
1. Rispondi in italiano chiaro e professionale
2. Fornisci numeri e calcoli quando possibile
3. Spiega i rischi in modo trasparente
4. Dai fonti e link a blockchain explorer
5. Suggerisci follow-up questions pertinenti
6. Se non hai dati sufficienti, spiega cosa serve

FORMATO RISPOSTA (JSON):
{
  "answer": "risposta dettagliata",
  "confidence": "HIGH|MEDIUM|LOW",
  "sources": ["fonte1", "fonte2"],
  "warnings": ["warning1", "warning2"],
  "rawData": { /* dati grezzi se richiesto */ },
  "followUpQuestions": ["domanda1", "domanda2"]
}`;

    return prompt;
  }

  private validateAndStructureResponse(aiResponse: any, question: FinancialQuestion): AIChatResponse {
    try {
      // Se la risposta è già un oggetto valido, usala
      if (typeof aiResponse === 'object' && aiResponse.answer) {
        return {
          ...aiResponse,
          timestamp: new Date().toISOString(),
        };
      }

      // Se è una stringa, parsala come JSON o usa come answer diretta
      let parsedResponse;
      if (typeof aiResponse === 'string') {
        try {
          parsedResponse = JSON.parse(aiResponse);
        } catch {
          // Se non è JSON valido, usa la stringa come risposta
          parsedResponse = {
            answer: aiResponse,
            confidence: 'MEDIUM',
            sources: [],
          };
        }
      } else {
        parsedResponse = aiResponse;
      }

      // Valida con Zod schema
      const validated = AIChatResponseSchema.parse({
        answer: parsedResponse.answer || String(aiResponse),
        confidence: parsedResponse.confidence || 'MEDIUM',
        sources: parsedResponse.sources || [],
        warnings: parsedResponse.warnings || [],
        rawData: parsedResponse.rawData || null,
        followUpQuestions: parsedResponse.followUpQuestions || [],
        timestamp: new Date().toISOString(),
      });

      return validated;

    } catch (error) {
      console.error('Errore validazione risposta AI:', error);
      
      // Fallback sicuro
      return {
        answer: "Ho analizzato la tua richiesta ma ho riscontrato un problema nella formattazione della risposta. Contatta il supporto se il problema persiste.",
        confidence: 'LOW',
        sources: [],
        warnings: ['Problema nella formattazione della risposta'],
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper per domande comuni
  async getCommonQuestions(): Promise<Array<{type: FinancialQuestion['type'], question: string, description: string}>> {
    return [
      {
        type: 'VAULT_PERFORMANCE',
        question: "Come sta performando il mio vault?",
        description: "Analizza performance e ROI del tuo vault"
      },
      {
        type: 'RISK_ANALYSIS', 
        question: "Quali sono i rischi principali?",
        description: "Analisi completa dei rischi del protocollo"
      },
      {
        type: 'TRANSPARENCY_REQUEST',
        question: "Dove posso vedere tutte le mie transazioni?",
        description: "Visualizza storico transazioni e trasparenza"
      },
      {
        type: 'FEE_ANALYSIS',
        question: "Quanto sto pagando in fees?",
        description: "Dettaglio completo di tutte le fees"
      },
      {
        type: 'STRATEGY_EXPLANATION',
        question: "Come funziona la strategia del vault?",
        description: "Spiegazione dettagliata delle strategie"
      },
      {
        type: 'MARKET_CONDITIONS',
        question: "È un buon momento per investire?",
        description: "Analisi condizioni di mercato attuali"
      },
      {
        type: 'EMERGENCY_INFO',
        question: "Cosa fare in caso di emergenza?",
        description: "Procedure di emergenza e sicurezza"
      },
    ];
  }

  // Valida che la domanda sia appropriata e sicura
  validateQuestion(question: string): { valid: boolean; error?: string } {
    const dangerousPatterns = [
      /private.*key/i,
      /seed.*phrase/i,
      /mnemonic/i,
      /password/i,
      /\b\d{12,}\b/, // lunghe sequenze numeriche (potenziali chiavi)
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(question)) {
        return {
          valid: false,
          error: 'Per tua sicurezza, non condividere mai chiavi private, seed phrase o informazioni sensibili.'
        };
      }
    }

    if (question.length < 10) {
      return {
        valid: false,
        error: 'La domanda è troppo breve. Per favore, fornisci più dettagli.'
      };
    }

    if (question.length > 1000) {
      return {
        valid: false,
        error: 'La domanda è troppo lunga. Per favore, sintetizza la tua richiesta.'
      };
    }

    return { valid: true };
  }
}

// Singleton instance
export const aiTransparencyChat = new AITransparencyChat();