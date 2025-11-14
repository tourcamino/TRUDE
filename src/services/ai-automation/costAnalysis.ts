import { AICommissionStructure } from './leadGenerationSystem';

export interface CostBreakdown {
  category: string;
  tools: ToolCost[];
  monthlyCost: number;
  annualCost: number;
  roi: number;
  efficiencyGain: string;
}

export interface ToolCost {
  name: string;
  monthlyCost: number;
  annualCost: number;
  purpose: string;
  aiPremium: boolean;
  alternatives: string[];
}

export interface AutomationROI {
  manualCost: number;
  automatedCost: number;
  savings: number;
  efficiencyMultiplier: number;
  paybackPeriod: string;
  annualSavings: number;
}

export const completeCostAnalysis: CostBreakdown[] = [
  {
    category: 'AI & Automation Core',
    monthlyCost: 2850,
    annualCost: 34200,
    roi: 400,
    efficiencyGain: 'Automates 85% of lead generation tasks',
    tools: [
      {
        name: 'OpenAI GPT-4 API',
        monthlyCost: 800,
        annualCost: 9600,
        purpose: 'Content generation, personalization, analytics',
        aiPremium: true,
        alternatives: ['Claude-3', 'Gemini Pro']
      },
      {
        name: 'LinkedIn Sales Navigator',
        monthlyCost: 99,
        annualCost: 1188,
        purpose: 'Advanced prospecting and outreach',
        aiPremium: false,
        alternatives: ['Apollo.io', 'ZoomInfo']
      },
      {
        name: 'Apollo.io Pro',
        monthlyCost: 149,
        annualCost: 1788,
        purpose: 'Contact database and email automation',
        aiPremium: false,
        alternatives: ['ZoomInfo', 'Lusha']
      },
      {
        name: 'Zapier Enterprise',
        monthlyCost: 599,
        annualCost: 7188,
        purpose: 'Workflow automation and integrations',
        aiPremium: true,
        alternatives: ['Make.com', 'n8n']
      },
      {
        name: 'PhantomBuster Pro',
        monthlyCost: 99,
        annualCost: 1188,
        purpose: 'LinkedIn automation and data extraction',
        aiPremium: true,
        alternatives: ['Expandi', 'Dripify']
      },
      {
        name: 'Instantly.ai Scale',
        monthlyCost: 497,
        annualCost: 5964,
        purpose: 'Cold email automation with AI optimization',
        aiPremium: true,
        alternatives: ['Smartlead', 'Reply.io']
      },
      {
        name: 'Clay.com Pro',
        monthlyCost: 800,
        annualCost: 9600,
        purpose: 'AI-powered data enrichment and research',
        aiPremium: true,
        alternatives: ['Captain Data', 'Phantombuster']
      },
      {
        name: 'Customer.io Premium',
        monthlyCost: 594,
        annualCost: 7128,
        purpose: 'Behavioral email automation',
        aiPremium: true,
        alternatives: ['Klaviyo', 'Braze']
      }
    ]
  },
  {
    category: 'Analytics & Tracking',
    monthlyCost: 1200,
    annualCost: 14400,
    roi: 250,
    efficiencyGain: 'Real-time performance optimization',
    tools: [
      {
        name: 'Amplitude Analytics',
        monthlyCost: 500,
        annualCost: 6000,
        purpose: 'User behavior analytics and funnel optimization',
        aiPremium: true,
        alternatives: ['Mixpanel', 'Heap']
      },
      {
        name: 'Segment CDP',
        monthlyCost: 350,
        annualCost: 4200,
        purpose: 'Customer data platform and event tracking',
        aiPremium: false,
        alternatives: ['RudderStack', 'mParticle']
      },
      {
        name: 'Tableau Pro',
        monthlyCost: 75,
        annualCost: 900,
        purpose: 'Advanced data visualization and reporting',
        aiPremium: true,
        alternatives: ['Power BI', 'Looker']
      },
      {
        name: 'Google Analytics 360',
        monthlyCost: 275,
        annualCost: 3300,
        purpose: 'Web analytics and attribution',
        aiPremium: true,
        alternatives: ['Adobe Analytics']
      }
    ]
  },
  {
    category: 'CRM & Sales Intelligence',
    monthlyCost: 1800,
    annualCost: 21600,
    roi: 300,
    efficiencyGain: 'Automated lead scoring and qualification',
    tools: [
      {
        name: 'Salesforce Einstein',
        monthlyCost: 1250,
        annualCost: 15000,
        purpose: 'AI-powered CRM with predictive lead scoring',
        aiPremium: true,
        alternatives: ['HubSpot', 'Pipedrive']
      },
      {
        name: 'Gong.io Enterprise',
        monthlyCost: 400,
        annualCost: 4800,
        purpose: 'Conversation intelligence and deal coaching',
        aiPremium: true,
        alternatives: ['Chorus.ai', 'Wingman']
      },
      {
        name: 'Drift Premium',
        monthlyCost: 150,
        annualCost: 1800,
        purpose: 'AI chatbot for lead qualification',
        aiPremium: true,
        alternatives: ['Intercom', 'Qualified']
      }
    ]
  },
  {
    category: 'Content & Creative AI',
    monthlyCost: 900,
    annualCost: 10800,
    roi: 500,
    efficiencyGain: 'Automates 90% of content creation',
    tools: [
      {
        name: 'Jasper.ai Boss Mode',
        monthlyCost: 99,
        annualCost: 1188,
        purpose: 'AI copywriting for emails and landing pages',
        aiPremium: true,
        alternatives: ['Copy.ai', 'Writesonic']
      },
      {
        name: 'Midjourney Pro',
        monthlyCost: 60,
        annualCost: 720,
        purpose: 'AI image generation for creatives',
        aiPremium: true,
        alternatives: ['DALL-E', 'Stable Diffusion']
      },
      {
        name: 'Surfer SEO',
        monthlyCost: 239,
        annualCost: 2868,
        purpose: 'AI-powered SEO optimization',
        aiPremium: true,
        alternatives: ['Frase', 'MarketMuse']
      },
      {
        name: 'Canva Pro',
        monthlyCost: 15,
        annualCost: 180,
        purpose: 'Design automation and templates',
        aiPremium: true,
        alternatives: ['Adobe Creative Suite']
      },
      {
        name: 'Lumen5 Premium',
        monthlyCost: 199,
        annualCost: 2388,
        purpose: 'AI video creation for social media',
        aiPremium: true,
        alternatives: ['Pictory', 'Synthesia']
      },
      {
        name: 'Descript Pro',
        monthlyCost: 30,
        annualCost: 360,
        purpose: 'AI audio/video editing for webinars',
        aiPremium: true,
        alternatives: ['Adobe Premiere', 'Final Cut']
      },
      {
        name: 'Notion AI',
        monthlyCost: 10,
        annualCost: 120,
        purpose: 'AI knowledge management and documentation',
        aiPremium: true,
        alternatives: ['Mem', 'Craft']
      },
      {
        name: 'Otter.ai Business',
        monthlyCost: 30,
        annualCost: 360,
        purpose: 'AI transcription for meetings and calls',
        aiPremium: true,
        alternatives: ['Fireflies', 'Grain']
      }
    ]
  },
  {
    category: 'Infrastructure & Security',
    monthlyCost: 650,
    annualCost: 7800,
    roi: 150,
    efficiencyGain: 'Enterprise-grade reliability and security',
    tools: [
      {
        name: 'AWS Business Support',
        monthlyCost: 100,
        annualCost: 1200,
        purpose: 'Cloud infrastructure and support',
        aiPremium: false,
        alternatives: ['Google Cloud', 'Azure']
      },
      {
        name: 'Cloudflare Pro',
        monthlyCost: 20,
        annualCost: 240,
        purpose: 'CDN, security, and performance',
        aiPremium: true,
        alternatives: ['AWS CloudFront', 'Fastly']
      },
      {
        name: 'Auth0',
        monthlyCost: 130,
        annualCost: 1560,
        purpose: 'Authentication and user management',
        aiPremium: false,
        alternatives: ['Firebase Auth', 'AWS Cognito']
      },
      {
        name: 'Datadog APM',
        monthlyCost: 350,
        annualCost: 4200,
        purpose: 'Application performance monitoring',
        aiPremium: true,
        alternatives: ['New Relic', 'AppDynamics']
      },
      {
        name: 'Sentry',
        monthlyCost: 26,
        annualCost: 312,
        purpose: 'Error tracking and monitoring',
        aiPremium: true,
        alternatives: ['Bugsnag', 'Rollbar']
      },
      {
        name: '1Password Business',
        monthlyCost: 8,
        annualCost: 96,
        purpose: 'Team password management',
        aiPremium: false,
        alternatives: ['LastPass', 'Bitwarden']
      },
      {
        name: 'Vanta',
        monthlyCost: 16,
        annualCost: 192,
        purpose: 'Security compliance automation',
        aiPremium: true,
        alternatives: ['Drata', 'Secureframe']
      }
    ]
  }
];

// 📊 AUTOMATION ROI CALCULATION
export const calculateAutomationROI = (targetCompanies: number = 50): AutomationROI => {
  // Manual process costs (without AI)
  const manualCosts = {
    researchPerCompany: 8, // hours
    outreachPerCompany: 4, // hours
    followUpPerCompany: 6, // hours
    hourlyRate: 75, // $/hour
    toolsCost: 500 // basic tools monthly
  };

  const totalManualHours = targetCompanies * (manualCosts.researchPerCompany + manualCosts.outreachPerCompany + manualCosts.followUpPerCompany);
  const manualCost = (totalManualHours * manualCosts.hourlyRate) + (manualCosts.toolsCost * 12);

  // Automated process costs (with AI)
  const automatedCosts = {
    setupTime: 40, // hours initial setup
    monitoringTime: 2, // hours per month
    aiToolsCost: completeCostAnalysis.reduce((sum, category) => sum + category.annualCost, 0),
    hourlyRate: 75
  };

  const automatedCost = (automatedCosts.setupTime * automatedCosts.hourlyRate) + 
                         (automatedCosts.monitoringTime * automatedCosts.hourlyRate * 12) + 
                         automatedCosts.aiToolsCost;

  const savings = manualCost - automatedCost;
  const efficiencyMultiplier = totalManualHours / (automatedCosts.setupTime + (automatedCosts.monitoringTime * 12));

  return {
    manualCost,
    automatedCost,
    savings,
    efficiencyMultiplier,
    paybackPeriod: '3-4 months',
    annualSavings: savings
  };
};

// 💰 AI COMMISSION STRUCTURE FOR DIFFERENT TIERS
export const aiCommissionTiers = {
  'startup': {
    maxVolume: 1000000, // $1M monthly volume
    commissionRate: 0.08, // 8%
    monthlyFee: 500,
    setupFee: 1000,
    features: ['Basic automation', 'Email sequences', 'LinkedIn outreach', 'Standard reporting']
  },
  'growth': {
    maxVolume: 10000000, // $10M monthly volume
    commissionRate: 0.06, // 6%
    monthlyFee: 1500,
    setupFee: 2500,
    features: ['Advanced personalization', 'Predictive analytics', 'A/B testing', 'Custom integrations']
  },
  'enterprise': {
    maxVolume: 100000000, // $100M monthly volume
    commissionRate: 0.04, // 4%
    monthlyFee: 5000,
    setupFee: 10000,
    features: ['Full AI orchestration', 'Real-time optimization', 'White-label solution', 'Dedicated support']
  },
  'custom': {
    maxVolume: Infinity,
    commissionRate: 0.02, // 2% (negotiable)
    monthlyFee: 15000,
    setupFee: 50000,
    features: ['Custom AI models', 'Private cloud deployment', '24/7 support', 'SLA guarantees']
  }
};

// 🎯 RECOMMENDED AI TOOL STACK BY BUDGET
export const budgetRecommendations = {
  'bootstrap': {
    monthlyBudget: 500,
    essentialTools: ['OpenAI API', 'Apollo.io', 'LinkedIn Sales Navigator', 'Zapier'],
    expectedLeads: 20,
    conversionRate: 0.05,
    roi: 200
  },
  'growth': {
    monthlyBudget: 2000,
    essentialTools: ['OpenAI API', 'Salesforce', 'Gong.io', 'Clay.com', 'Amplitude'],
    expectedLeads: 100,
    conversionRate: 0.08,
    roi: 350
  },
  'scale': {
    monthlyBudget: 5000,
    essentialTools: ['Full stack', 'Custom AI models', 'Enterprise CRM', 'Advanced analytics'],
    expectedLeads: 300,
    conversionRate: 0.12,
    roi: 500
  },
  'enterprise': {
    monthlyBudget: 15000,
    essentialTools: ['Custom everything', 'Private AI', 'White-label', 'Dedicated team'],
    expectedLeads: 1000,
    conversionRate: 0.15,
    roi: 800
  }
};

// 📈 COST PROJECTIONS BY COMPANY TIER
export const tierBasedProjections = {
  tier1: {
    companies: 5, // Cargill, ADM, LDC, etc.
    avgCommission: 2000, // $2M monthly
    automationCost: 8500, // monthly
    expectedConversion: 0.15, // 15%
    paybackPeriod: '2 months'
  },
  tier2: {
    companies: 15, // Olam, Wilmar, etc.
    avgCommission: 800, // $800K monthly
    automationCost: 4500, // monthly
    expectedConversion: 0.25, // 25%
    paybackPeriod: '1.5 months'
  },
  tier3: {
    companies: 30, // Sucafina, Volcafe, etc.
    avgCommission: 200, // $200K monthly
    automationCost: 2000, // monthly
    expectedConversion: 0.35, // 35%
    paybackPeriod: '1 month'
  }
};

// 💡 COST OPTIMIZATION STRATEGIES
export const optimizationStrategies = [
  {
    strategy: 'Tool Consolidation',
    savings: 30,
    implementation: 'Replace overlapping tools with all-in-one solutions',
    timeline: '2-4 weeks'
  },
  {
    strategy: 'AI Model Optimization',
    savings: 25,
    implementation: 'Use smaller models for specific tasks, fine-tune prompts',
    timeline: '1-2 weeks'
  },
  {
    strategy: 'Volume Discounts',
    savings: 20,
    implementation: 'Negotiate annual contracts with enterprise tiers',
    timeline: '1 month'
  },
  {
    strategy: 'Open Source Alternatives',
    savings: 40,
    implementation: 'Replace commercial tools with open source where possible',
    timeline: '2-3 months'
  },
  {
    strategy: 'Usage Optimization',
    savings: 15,
    implementation: 'Monitor and optimize API calls, storage, compute',
    timeline: 'Ongoing'
  }
];

// 🚀 SCALING COST PROJECTIONS
export const scalingProjections = {
  phase1: {
    companies: 10,
    monthlyCost: 3500,
    expectedRevenue: 500000,
    roi: 14200,
    timeline: 'Months 1-3'
  },
  phase2: {
    companies: 25,
    monthlyCost: 6500,
    expectedRevenue: 2000000,
    roi: 30700,
    timeline: 'Months 4-6'
  },
  phase3: {
    companies: 50,
    monthlyCost: 12000,
    expectedRevenue: 8000000,
    roi: 66600,
    timeline: 'Months 7-12'
  }
};