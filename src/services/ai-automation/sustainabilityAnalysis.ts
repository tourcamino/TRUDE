import { completeCostAnalysis, calculateAutomationROI, tierBasedProjections } from './costAnalysis';

export interface SustainabilityMetrics {
  breakEvenPoint: number; // months
  cashFlowProjection: CashFlowMonth[];
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  scalabilityThresholds: ScalabilityThreshold[];
  unitEconomics: UnitEconomics;
}

export interface CashFlowMonth {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulative: number;
  clientAcquisition: number;
  churnRate: number;
}

export interface RiskFactor {
  category: 'market' | 'operational' | 'financial' | 'technical' | 'regulatory';
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  earlyWarning: string[];
  mitigationCost: number;
}

export interface MitigationStrategy {
  riskCategory: string;
  strategy: string;
  implementationCost: number;
  effectiveness: number; // 0-1
  timeline: string;
  responsible: string;
}

export interface ScalabilityThreshold {
  clientCount: number;
  monthlyVolume: number;
  requiredInvestment: number;
  infrastructureNeeds: string[];
  teamRequirements: string[];
  timeline: string;
}

export interface UnitEconomics {
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  paybackPeriod: number; // months
  monthlyChurnRate: number;
  expansionRevenue: number;
  grossMargin: number;
  ltvCacRatio: number;
}

// 📊 DETAILED SUSTAINABILITY ANALYSIS
export const sustainabilityAnalysis: SustainabilityMetrics = {
  breakEvenPoint: 1.2, // months
  cashFlowProjection: [
    {
      month: 1,
      revenue: 28000, // Conservative: 1 tier-2, 3 tier-3 clients
      costs: 7400,
      profit: 20600,
      cumulative: 20600,
      clientAcquisition: 4,
      churnRate: 0.02
    },
    {
      month: 3,
      revenue: 94000, // Target scenario
      costs: 7400,
      profit: 86600,
      cumulative: 225800,
      clientAcquisition: 8,
      churnRate: 0.015
    },
    {
      month: 6,
      revenue: 156000, // Growth scenario
      costs: 8900, // +20% for scaling
      profit: 147100,
      cumulative: 678500,
      clientAcquisition: 12,
      churnRate: 0.01
    },
    {
      month: 12,
      revenue: 280000, // Mature scenario
      costs: 12000, // +60% for full scale
      profit: 268000,
      cumulative: 2457800,
      clientAcquisition: 18,
      churnRate: 0.008
    }
  ],

  riskFactors: [
    {
      category: 'market',
      probability: 0.3,
      impact: 'medium',
      description: 'Commodity market downturn reducing arbitrage opportunities',
      earlyWarning: ['Volatility index < 15%', 'Trading volume decline > 30%', 'Client hesitation signals'],
      mitigationCost: 50000
    },
    {
      category: 'operational',
      probability: 0.2,
      impact: 'high',
      description: 'AI system failures or API outages disrupting automation',
      earlyWarning: ['API response time > 5s', 'Error rate > 2%', 'System downtime alerts'],
      mitigationCost: 25000
    },
    {
      category: 'financial',
      probability: 0.15,
      impact: 'medium',
      description: 'Client payment delays or defaults affecting cash flow',
      earlyWarning: ['Payment delays > 30 days', 'Credit rating changes', 'Industry financial stress'],
      mitigationCost: 100000
    },
    {
      category: 'technical',
      probability: 0.25,
      impact: 'low',
      description: 'Integration challenges with client legacy systems',
      earlyWarning: ['API compatibility issues', 'Data format mismatches', 'Security concerns'],
      mitigationCost: 15000
    },
    {
      category: 'regulatory',
      probability: 0.1,
      impact: 'critical',
      description: 'New regulations affecting commodity trading or AI usage',
      earlyWarning: ['Regulatory announcements', 'Compliance inquiries', 'Industry lobbying'],
      mitigationCost: 200000
    }
  ],

  mitigationStrategies: [
    {
      riskCategory: 'market',
      strategy: 'Diversify into multiple commodity verticals and geographic markets',
      implementationCost: 50000,
      effectiveness: 0.8,
      timeline: '3-6 months',
      responsible: 'Chief Revenue Officer'
    },
    {
      riskCategory: 'operational',
      strategy: 'Implement redundant AI systems and manual fallback procedures',
      implementationCost: 25000,
      effectiveness: 0.9,
      timeline: '1-2 months',
      responsible: 'CTO'
    },
    {
      riskCategory: 'financial',
      strategy: 'Establish credit insurance and diversified payment terms',
      implementationCost: 100000,
      effectiveness: 0.85,
      timeline: '2-3 months',
      responsible: 'CFO'
    },
    {
      riskCategory: 'technical',
      strategy: 'Build flexible integration layer with multiple API endpoints',
      implementationCost: 15000,
      effectiveness: 0.75,
      timeline: '1 month',
      responsible: 'Head of Engineering'
    },
    {
      riskCategory: 'regulatory',
      strategy: 'Establish legal compliance team and regulatory monitoring',
      implementationCost: 200000,
      effectiveness: 0.95,
      timeline: '6-12 months',
      responsible: 'Chief Legal Officer'
    }
  ],

  scalabilityThresholds: [
    {
      clientCount: 10,
      monthlyVolume: 50000000, // $50M
      requiredInvestment: 50000,
      infrastructureNeeds: ['Additional AI compute', 'Enhanced security', 'Backup systems'],
      teamRequirements: ['DevOps engineer', 'Customer success manager'],
      timeline: 'Month 3'
    },
    {
      clientCount: 25,
      monthlyVolume: 200000000, // $200M
      requiredInvestment: 150000,
      infrastructureNeeds: ['Enterprise-grade infrastructure', 'Multi-region deployment', 'Advanced monitoring'],
      teamRequirements: ['Senior engineers', 'Compliance officer', 'Account executives'],
      timeline: 'Month 6'
    },
    {
      clientCount: 50,
      monthlyVolume: 500000000, // $500M
      requiredInvestment: 500000,
      infrastructureNeeds: ['Private cloud', 'Custom AI models', 'Enterprise integrations'],
      teamRequirements: ['Full engineering team', 'Legal team', 'Enterprise sales'],
      timeline: 'Month 12'
    },
    {
      clientCount: 100,
      monthlyVolume: 1000000000, // $1B
      requiredInvestment: 2000000,
      infrastructureNeeds: ['Global infrastructure', 'Custom everything', 'White-label solutions'],
      teamRequirements: ['Complete organization', 'Regional teams', 'Executive team'],
      timeline: 'Month 24'
    }
  ],

  unitEconomics: {
    customerAcquisitionCost: 8500, // Based on automation costs
    customerLifetimeValue: 2400000, // $2M average commission over 24 months
    paybackPeriod: 1.2, // months
    monthlyChurnRate: 0.01, // 1% (very low for enterprise)
    expansionRevenue: 0.3, // 30% from existing clients
    grossMargin: 0.92, // 92%
    ltvCacRatio: 282 // Extremely healthy
  }
};

// 🎯 SUSTAINABILITY SCORE CALCULATION
export const calculateSustainabilityScore = (currentMetrics: any): {
  overallScore: number;
  categoryScores: any;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
} => {
  const metrics = sustainabilityAnalysis;
  
  // Financial sustainability (40% weight)
  const financialScore = Math.min((metrics.unitEconomics.grossMargin * 100) + 
                                  (metrics.unitEconomics.ltvCacRatio / 10) + 
                                  ((12 - metrics.unitEconomics.paybackPeriod) * 5), 100);

  // Operational sustainability (30% weight)
  const operationalScore = Math.min((1 - metrics.unitEconomics.monthlyChurnRate) * 100 + 
                                     (metrics.unitEconomics.expansionRevenue * 100) + 40, 100);

  // Market sustainability (20% weight)
  const avgRiskProbability = metrics.riskFactors.reduce((sum, risk) => sum + risk.probability, 0) / metrics.riskFactors.length;
  const marketScore = (1 - avgRiskProbability) * 100;

  // Scalability sustainability (10% weight)
  const scalabilityScore = Math.min(metrics.scalabilityThresholds.length * 15, 100);

  const overallScore = (financialScore * 0.4) + (operationalScore * 0.3) + (marketScore * 0.2) + (scalabilityScore * 0.1);

  let riskLevel: 'low' | 'medium' | 'high';
  if (overallScore > 80) riskLevel = 'low';
  else if (overallScore > 60) riskLevel = 'medium';
  else riskLevel = 'high';

  const recommendations = generateSustainabilityRecommendations(overallScore, metrics);

  return {
    overallScore: Math.round(overallScore),
    categoryScores: {
      financial: Math.round(financialScore),
      operational: Math.round(operationalScore),
      market: Math.round(marketScore),
      scalability: Math.round(scalabilityScore)
    },
    recommendations,
    riskLevel
  };
};

function generateSustainabilityRecommendations(score: number, metrics: any): string[] {
  const recommendations = [];

  if (score < 70) {
    recommendations.push('Focus on improving unit economics before scaling');
    recommendations.push('Implement stronger churn reduction strategies');
    recommendations.push('Diversify revenue streams to reduce market risk');
  }

  if (metrics.unitEconomics.paybackPeriod > 6) {
    recommendations.push('Optimize customer acquisition costs');
    recommendations.push('Improve conversion rates through better targeting');
  }

  if (metrics.unitEconomics.monthlyChurnRate > 0.05) {
    recommendations.push('Implement customer success programs');
    recommendations.push('Enhance onboarding experience');
    recommendations.push('Develop expansion revenue opportunities');
  }

  if (score > 85) {
    recommendations.push('Accelerate growth investment - model is highly sustainable');
    recommendations.push('Consider international expansion');
    recommendations.push('Explore strategic partnerships');
  }

  return recommendations;
}

// 📈 COMPETITIVE SUSTAINABILITY COMPARISON
export const competitiveSustainability = {
  trude: {
    grossMargin: 0.92,
    paybackPeriod: 1.2,
    churnRate: 0.01,
    ltvCacRatio: 282,
    marketRisk: 'low',
    scalability: 'high'
  },
  traditionalSaaS: {
    grossMargin: 0.75,
    paybackPeriod: 12,
    churnRate: 0.05,
    ltvCacRatio: 5,
    marketRisk: 'medium',
    scalability: 'medium'
  },
  consulting: {
    grossMargin: 0.35,
    paybackPeriod: 3,
    churnRate: 0.08,
    ltvCacRatio: 8,
    marketRisk: 'high',
    scalability: 'low'
  },
  tradingPlatform: {
    grossMargin: 0.65,
    paybackPeriod: 8,
    churnRate: 0.06,
    ltvCacRatio: 12,
    marketRisk: 'high',
    scalability: 'medium'
  }
};

// 🚀 SUSTAINABILITY IMPROVEMENT ROADMAP
export const sustainabilityRoadmap = [
  {
    phase: 'Foundation (Months 1-3)',
    objectives: ['Establish unit economics', 'Minimize churn', 'Optimize CAC'],
    investments: 100000,
    expectedImprovements: { margin: 0.05, payback: -0.3, churn: -0.005 },
    successMetrics: ['<1.5 months payback', '<2% churn', '>90% gross margin']
  },
  {
    phase: 'Growth (Months 4-9)',
    objectives: ['Scale acquisition', 'Expand revenue', 'Enter new markets'],
    investments: 500000,
    expectedImprovements: { margin: 0.02, payback: -0.2, churn: -0.003 },
    successMetrics: ['<1 month payback', '<1% churn', '>300 LTV/CAC']
  },
  {
    phase: 'Maturity (Months 10-18)',
    objectives: ['Market leadership', 'Platform expansion', 'Strategic partnerships'],
    investments: 2000000,
    expectedImprovements: { margin: 0.01, payback: -0.1, churn: -0.002 },
    successMetrics: ['<0.8 months payback', '<0.5% churn', '>500 LTV/CAC']
  }
];