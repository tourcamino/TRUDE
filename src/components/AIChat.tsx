import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, Bot, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/trpc/react';
import { toast } from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  sources?: string[];
  warnings?: string[];
  loading?: boolean;
}

export interface QuickQuestion {
  type: string;
  question: string;
  description: string;
}

export function AIChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(`conv-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: commonQuestions } = api.aiCommonQuestions.useQuery();
  const aiChat = api.aiChat.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Messaggio di benvenuto iniziale
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `Ciao! Sono TRUDE-AI, il tuo assistente finanziario personale per il protocollo TRUDE. 

Posso aiutarti con:
📊 Performance dei vault e analisi ROI
🔍 Analisi dettagliata dei rischi
💰 Calcoli di profitto e fees
📈 Strategie di investimento
🚨 Informazioni di emergenza
💡 Trasparenza totale sulle operazioni

Chiedimi pure qualsiasi cosa sul tuo investimento!`,
      timestamp: new Date(),
      confidence: 'HIGH',
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Aggiungi messaggio di loading
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      type: 'assistant',
      content: 'Sto analizzando la tua richiesta finanziaria...',
      timestamp: new Date(),
      loading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const result = await aiChat.mutateAsync({
        message: {
          type: 'TRANSPARENCY_REQUEST', // Default, può essere migliorato con NLP
          question: input.trim(),
          context: {
            includeRawData: false,
          },
        },
        conversationId,
      });

      // Rimuovi messaggio di loading e aggiungi risposta
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'assistant',
          content: result.response.answer,
          timestamp: new Date(),
          confidence: result.response.confidence,
          sources: result.response.sources,
          warnings: result.response.warnings,
        };
        return [...filtered, aiMessage];
      });

      // Mostra warning se presenti
      if (result.response.warnings && result.response.warnings.length > 0) {
        toast.error(`⚠️ Warning: ${result.response.warnings.join(', ')}`);
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Rimuovi loading e mostra errore
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: 'Mi dispiace, si è verificato un errore nel processare la tua richiesta. Riprova tra qualche secondo.',
          timestamp: new Date(),
          confidence: 'LOW',
          warnings: ['Errore di sistema temporaneo'],
        };
        return [...filtered, errorMessage];
      });

      toast.error('Error communicating with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    setInput(question.question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">TRUDE AI Assistant</h3>
          <Badge variant="outline" className="text-xs">
            Zero-Error AI
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>24/7 Support</span>
        </div>
      </div>

      {/* Quick Questions */}
      {commonQuestions && commonQuestions.length > 0 && (
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm font-medium mb-2 text-gray-700">Domande frequenti:</p>
          <div className="flex flex-wrap gap-2">
            {commonQuestions.slice(0, 4).map((q, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(q)}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                {q.description}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.type === 'assistant' && message.confidence && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <Badge className={getConfidenceColor(message.confidence)}>
                      {message.confidence === 'HIGH' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {message.confidence === 'LOW' && <XCircle className="h-3 w-3 mr-1" />}
                      Affidabilità: {message.confidence}
                    </Badge>
                  </div>
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Fonti:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {message.warnings && message.warnings.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">Avvisi:</span>
                    </div>
                    {message.warnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-yellow-700">• {warning}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center order-2">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Chiedimi qualcosa sul tuo investimento..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          💡 Suggerimento: Puoi chiedermi di analizzare performance, rischi, fees o strategie di investimento.
        </p>
      </div>
    </div>
  );
}