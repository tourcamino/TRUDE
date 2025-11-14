import { createFileRoute } from '@tanstack/react-router';
import { Card } from '~/components/ui/card';
import { Bot } from 'lucide-react';

export const Route = createFileRoute('/admin/ai-dashboard')({
  component: AIDashboardPage,
});

function AIDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          TRUDE AI System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sistema AI Zero-Error per analisi finanziaria, trasparenza e supporto decisionale. 
          Multi-provider con fallback automatico per garantire massima affidabilità.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ AI Dashboard in development. Components will be added soon.
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="text-center py-12">
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-4">AI Dashboard Coming Soon</h2>
          <p className="text-gray-600">
            Advanced AI analytics and monitoring features are under development.
          </p>
        </Card>
      </div>
    </div>
  );
}