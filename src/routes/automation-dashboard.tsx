import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Settings,
  Filter
} from 'lucide-react';

interface KPIData {
  totalCompanies: number;
  contactedCompanies: number;
  responseRate: number;
  conversionRate: number;
  monthlyRevenue: number;
  automationCost: number;
  profit: number;
  roi: number;
  leadScore: number;
  aiOptimization: number;
}

interface CompanyProgress {
  id: string;
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  status: 'research' | 'contacted' | 'responded' | 'demo' | 'negotiation' | 'closed';
  lastContact: Date;
  nextAction: string;
  commissionPotential: number;
  leadScore: number;
  aiConfidence: number;
}

interface AutomationMetrics {
  emailsSent: number;
  linkedinConnections: number;
  aiGeneratedContent: number;
  aBTestsRunning: number;
  optimizationSuggestions: number;
  systemUptime: number;
  costPerLead: number;
  timeSaved: number;
}

export default function AutomationDashboard() {
  const [kpiData, setKPIData] = useState<KPIData>({
    totalCompanies: 50,
    contactedCompanies: 23,
    responseRate: 12.5,
    conversionRate: 3.2,
    monthlyRevenue: 94000,
    automationCost: 7400,
    profit: 86600,
    roi: 1170,
    leadScore: 78,
    aiOptimization: 85
  });

  const [companyProgress, setCompanyProgress] = useState<CompanyProgress[]>([
    {
      id: 'cargill',
      name: 'Cargill',
      tier: 'tier1',
      status: 'negotiation',
      lastContact: new Date('2024-11-10'),
      nextAction: 'Schedule executive presentation',
      commissionPotential: 2500000,
      leadScore: 95,
      aiConfidence: 87
    },
    {
      id: 'olam',
      name: 'Olam International',
      tier: 'tier2',
      status: 'demo',
      lastContact: new Date('2024-11-12'),
      nextAction: 'Follow up with ROI calculator',
      commissionPotential: 800000,
      leadScore: 88,
      aiConfidence: 82
    },
    {
      id: 'sucafina',
      name: 'Sucafina',
      tier: 'tier3',
      status: 'responded',
      lastContact: new Date('2024-11-13'),
      nextAction: 'Send case study',
      commissionPotential: 200000,
      leadScore: 72,
      aiConfidence: 68
    }
  ]);

  const [automationMetrics, setAutomationMetrics] = useState<AutomationMetrics>({
    emailsSent: 1247,
    linkedinConnections: 89,
    aiGeneratedContent: 342,
    aBTestsRunning: 15,
    optimizationSuggestions: 23,
    systemUptime: 99.8,
    costPerLead: 127,
    timeSaved: 156 // hours
  });

  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    const colors = {
      research: 'bg-gray-500',
      contacted: 'bg-blue-500',
      responded: 'bg-yellow-500',
      demo: 'bg-purple-500',
      negotiation: 'bg-orange-500',
      closed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      tier1: { color: 'bg-red-100 text-red-800', label: 'Tier 1' },
      tier2: { color: 'bg-orange-100 text-orange-800', label: 'Tier 2' },
      tier3: { color: 'bg-green-100 text-green-800', label: 'Tier 3' }
    };
    return badges[tier as keyof typeof badges] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };

  const filteredCompanies = companyProgress.filter(company => {
    const tierMatch = selectedTier === 'all' || company.tier === selectedTier;
    const statusMatch = selectedStatus === 'all' || company.status === selectedStatus;
    return tierMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 AI Automation Dashboard
          </h1>
          <p className="text-gray-600">
            Monitoraggio in tempo reale dell'automazione lead generation e performance di vendita
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                Aziende Contattate
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {kpiData.contactedCompanies}/{kpiData.totalCompanies}
              </div>
              <p className="text-xs text-blue-700">
                {((kpiData.contactedCompanies / kpiData.totalCompanies) * 100).toFixed(1)}% completato
              </p>
              <Progress value={(kpiData.contactedCompanies / kpiData.totalCompanies) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                Tasso di Risposta
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {kpiData.responseRate}%
              </div>
              <p className="text-xs text-green-700">
                +2.3% vs mese scorso
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Optimized
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                ROI Automazione
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {kpiData.roi}%
              </div>
              <p className="text-xs text-purple-700">
                ${kpiData.profit.toLocaleString()} profitto
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs bg-purple-200 text-purple-800">
                  <Target className="h-3 w-3 mr-1" />
                  On Target
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                Commissioni Potenziali
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                ${kpiData.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-orange-700">
                Mese corrente
              </p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="companies">Aziende</TabsTrigger>
            <TabsTrigger value="automation">Automazione</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Companies</span>
                      <span className="text-sm text-gray-600">{kpiData.totalCompanies}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Contacted</span>
                      <span className="text-sm text-gray-600">{kpiData.contactedCompanies} ({kpiData.responseRate}%)</span>
                    </div>
                    <Progress value={kpiData.responseRate} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Responded</span>
                      <span className="text-sm text-gray-600">{Math.round(kpiData.contactedCompanies * kpiData.responseRate / 100)}</span>
                    </div>
                    <Progress value={kpiData.responseRate * 0.8} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Converted</span>
                      <span className="text-sm text-gray-600">{Math.round(kpiData.contactedCompanies * kpiData.conversionRate / 100)} ({kpiData.conversionRate}%)</span>
                    </div>
                    <Progress value={kpiData.conversionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* AI Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Lead Scoring Accuracy</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">{kpiData.leadScore}%</span>
                        <Badge variant="outline" className="text-xs">+5%</Badge>
                      </div>
                    </div>
                    <Progress value={kpiData.leadScore} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">AI Optimization</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">{kpiData.aiOptimization}%</span>
                        <Badge variant="outline" className="text-xs">+12%</Badge>
                      </div>
                    </div>
                    <Progress value={kpiData.aiOptimization} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">System Uptime</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">{automationMetrics.systemUptime}%</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <Progress value={automationMetrics.systemUptime} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Time Saved</span>
                      <span className="text-sm text-gray-600">{automationMetrics.timeSaved} hours</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Equivalente a ${(automationMetrics.timeSaved * 75).toLocaleString()} di lavoro manuale
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Progresso Aziende Target</CardTitle>
                  <div className="flex gap-2">
                    <select 
                      value={selectedTier} 
                      onChange={(e) => setSelectedTier(e.target.value)}
                      className="text-sm border rounded-md px-2 py-1"
                    >
                      <option value="all">Tutti i Tier</option>
                      <option value="tier1">Tier 1</option>
                      <option value="tier2">Tier 2</option>
                      <option value="tier3">Tier 3</option>
                    </select>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="text-sm border rounded-md px-2 py-1"
                    >
                      <option value="all">Tutti gli Stati</option>
                      <option value="research">Research</option>
                      <option value="contacted">Contacted</option>
                      <option value="responded">Responded</option>
                      <option value="demo">Demo</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCompanies.map((company) => (
                    <div key={company.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTierBadge(company.tier).color}>
                              {getTierBadge(company.tier).label}
                            </Badge>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(company.status)}`}></div>
                            <span className="text-sm text-gray-600 capitalize">{company.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${company.commissionPotential.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">commissione potenziale</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Lead Score</div>
                          <div className="flex items-center gap-2">
                            <Progress value={company.leadScore} className="h-2 flex-1" />
                            <span className="text-sm font-semibold">{company.leadScore}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">AI Confidence</div>
                          <div className="flex items-center gap-2">
                            <Progress value={company.aiConfidence} className="h-2 flex-1" />
                            <span className="text-sm font-semibold">{company.aiConfidence}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Ultimo contatto: {company.lastContact.toLocaleDateString('it-IT')}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {company.nextAction}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Email Automation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email inviate</span>
                      <span className="font-semibold">{automationMetrics.emailsSent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tasso apertura</span>
                      <span className="font-semibold text-green-600">24.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tasto click</span>
                      <span className="font-semibold text-green-600">8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">A/B Tests</span>
                      <span className="font-semibold">{automationMetrics.aBTestsRunning}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    LinkedIn Outreach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Connessioni</span>
                      <span className="font-semibold">{automationMetrics.linkedinConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tasso accettazione</span>
                      <span className="font-semibold text-green-600">18.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Risposte</span>
                      <span className="font-semibold text-green-600">12.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Costo per lead</span>
                      <span className="font-semibold">${automationMetrics.costPerLead}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Content Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contenuti generati</span>
                      <span className="font-semibold">{automationMetrics.aiGeneratedContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Qualità media</span>
                      <span className="font-semibold text-green-600">8.4/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Suggerimenti AI</span>
                      <span className="font-semibold">{automationMetrics.optimizationSuggestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime sistema</span>
                      <span className="font-semibold text-green-600">{automationMetrics.systemUptime}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Insights & Raccomandazioni
                </CardTitle>
                <CardDescription>
                  Analisi predittiva e suggerimenti di ottimizzazione basati su AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Opportunità Immediate
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Focus su aziende Tier 2 - conversion rate attesa 25%</li>
                      <li>• Ottimizza timing email: martedì/mercoledì 10:00 AM</li>
                      <li>• Personalizza messaggi con dati commodity specifici</li>
                      <li>• Aggiungi case study di successo nel follow-up</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Aree di Attenzione
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Riduci frequenza email per aziende Tier 1 (rischio spam)</li>
                      <li>• Migliora subject lines - A/B test in corso</li>
                      <li>• Aggiorna dati commodity per maggiore rilevanza</li>
                      <li>• Monitora competitor activity su LinkedIn</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Performance Ottimali
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Lead scoring accuracy superiore al target (78% vs 70%)</li>
                      <li>• Costo per lead 65% inferiore alla media del settore</li>
                      <li>• Tempo di risposta AI sotto i 2 secondi</li>
                      <li>• Conversion rate in crescita per 3 mesi consecutivi</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Prossimi Passi AI
                    </h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Implementa sentiment analysis per risposte email</li>
                      <li>• Aggiungi predictive analytics per timing ottimale</li>
                      <li>• Sviluppa personalizzazione dinamica basata su behavior</li>
                      <li>• Integra social listening per opportunità real-time</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}