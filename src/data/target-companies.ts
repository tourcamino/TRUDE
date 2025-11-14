export interface TargetCompany {
  id: string;
  name: string;
  revenue: number;
  commodities: string[];
  headquarters: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  decisionMakers: Contact[];
  painPoints: string[];
  techStack: string[];
  linkedinUrl: string;
  website: string;
  estimatedArbitrageVolume: number; // Monthly in millions
  commissionPotential: number; // Monthly in thousands
}

export interface Contact {
  name: string;
  title: string;
  email?: string;
  linkedin: string;
  priority: 'high' | 'medium' | 'low';
  influence: 'decision' | 'influence' | 'user';
}

export const targetCompanies: TargetCompany[] = [
  // TIER 1 - MEGA CORPORATIONS
  {
    id: 'cargill',
    name: 'Cargill',
    revenue: 177000000000,
    commodities: ['wheat', 'corn', 'soybeans', 'palm oil'],
    headquarters: 'Minnetonka, MN, USA',
    tier: 'tier1',
    decisionMakers: [
      {
        name: 'Brian Sikes',
        title: 'CEO',
        linkedin: 'https://linkedin.com/in/brian-sikes-123456',
        priority: 'high',
        influence: 'decision'
      },
      {
        name: 'David Dines',
        title: 'CTO',
        linkedin: 'https://linkedin.com/in/david-dines-789012',
        priority: 'high',
        influence: 'decision'
      },
      {
        name: 'Anna Walker',
        title: 'Head of Global Trading',
        linkedin: 'https://linkedin.com/in/anna-walker-345678',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Price volatility in commodity markets',
      'Cross-border payment delays (5-7 days)',
      'Currency hedging costs (2-3% of transaction value)',
      'Manual reconciliation across 70+ countries',
      'Regulatory compliance in multiple jurisdictions'
    ],
    techStack: ['SAP', 'Oracle', 'Blockchain pilots', 'Traditional banking'],
    linkedinUrl: 'https://linkedin.com/company/cargill',
    website: 'https://www.cargill.com',
    estimatedArbitrageVolume: 2500, // $2.5B monthly
    commissionPotential: 2500 // $2.5M monthly at 0.1%
  },
  {
    id: 'adm',
    name: 'Archer Daniels Midland',
    revenue: 101000000000,
    commodities: ['soybean oil', 'corn', 'wheat'],
    headquarters: 'Chicago, IL, USA',
    tier: 'tier1',
    decisionMakers: [
      {
        name: 'Juan Luciano',
        title: 'CEO',
        linkedin: 'https://linkedin.com/in/juan-luciano-901234',
        priority: 'high',
        influence: 'decision'
      },
      {
        name: 'Greg Morris',
        title: 'President, Ag Services & Oilseeds',
        linkedin: 'https://linkedin.com/in/greg-morris-567890',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Margin compression in traditional trading',
      'Supply chain visibility gaps',
      'Working capital optimization',
      'Price discovery inefficiencies',
      'Counterparty risk management'
    ],
    techStack: ['SAP', 'Custom trading platforms', 'Traditional derivatives'],
    linkedinUrl: 'https://linkedin.com/company/adm',
    website: 'https://www.adm.com',
    estimatedArbitrageVolume: 1800,
    commissionPotential: 1800
  },
  {
    id: 'ldc',
    name: 'Louis Dreyfus Company',
    revenue: 49000000000,
    commodities: ['coffee', 'cotton', 'rice', 'orange juice'],
    headquarters: 'Rotterdam, Netherlands',
    tier: 'tier1',
    decisionMakers: [
      {
        name: 'Michael Gelchie',
        title: 'CEO',
        linkedin: 'https://linkedin.com/in/michael-gelchie-234567',
        priority: 'high',
        influence: 'decision'
      },
      {
        name: 'James Levine',
        title: 'Global Head of Coffee',
        linkedin: 'https://linkedin.com/in/james-levine-890123',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Coffee price volatility (±20% monthly)',
      'Seasonal cash flow mismatches',
      'Quality arbitrage opportunities',
      'Origin country currency risks',
      'Climate change impact on pricing'
    ],
    techStack: ['Custom LDC platform', 'Bloomberg Terminal', 'Traditional hedging'],
    linkedinUrl: 'https://linkedin.com/company/louis-dreyfus-company',
    website: 'https://www.ldc.com',
    estimatedArbitrageVolume: 1200,
    commissionPotential: 1200
  },

  // TIER 2 - LARGE ENTERPRISES
  {
    id: 'olam',
    name: 'Olam International',
    revenue: 23000000000,
    commodities: ['cocoa', 'coffee', 'nuts', 'spices'],
    headquarters: 'Singapore',
    tier: 'tier2',
    decisionMakers: [
      {
        name: 'Sunny Verghese',
        title: 'Group CEO',
        linkedin: 'https://linkedin.com/in/sunny-verghese-456789',
        priority: 'high',
        influence: 'decision'
      },
      {
        name: 'Shekhar Anantharaman',
        title: 'COO',
        linkedin: 'https://linkedin.com/in/shekhar-anantharaman-012345',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Sustainability reporting requirements',
      'Traceability from farm to fork',
      'Smallholder farmer payment delays',
      'Quality premium arbitrage',
      'Origin verification costs'
    ],
    techStack: ['SAP', 'Olam Farmer Information System', 'Blockchain pilots'],
    linkedinUrl: 'https://linkedin.com/company/olam-international',
    website: 'https://www.olamgroup.com',
    estimatedArbitrageVolume: 800,
    commissionPotential: 800
  },
  {
    id: 'wilmar',
    name: 'Wilmar International',
    revenue: 51000000000,
    commodities: ['palm oil', 'sugar', 'fertilizers'],
    headquarters: 'Singapore',
    tier: 'tier2',
    decisionMakers: [
      {
        name: 'Kuok Khoon Hong',
        title: 'CEO',
        linkedin: 'https://linkedin.com/in/kuok-khoon-hong-789012',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Palm oil sustainability certification',
      'Refining margin optimization',
      'Biodiesel blending arbitrage',
      'Weather-related supply disruptions',
      'Indonesian/Malaysian regulatory changes'
    ],
    techStack: ['Custom Wilmar platform', 'Satellite monitoring', 'IoT sensors'],
    linkedinUrl: 'https://linkedin.com/company/wilmar-international',
    website: 'https://www.wilmar-international.com',
    estimatedArbitrageVolume: 900,
    commissionPotential: 900
  },

  // TIER 3 - MID-MARKET SPECIALISTS
  {
    id: 'sucafina',
    name: 'Sucafina',
    revenue: 2000000000,
    commodities: ['specialty coffee'],
    headquarters: 'Geneva, Switzerland',
    tier: 'tier3',
    decisionMakers: [
      {
        name: 'Nicolas Tamari',
        title: 'CEO',
        linkedin: 'https://linkedin.com/in/nicolas-tamari-123456',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Specialty coffee price premiums volatility',
      'Micro-lot traceability requirements',
      'Direct trade payment complexities',
      'Quality scoring arbitrage',
      'Seasonal cash flow challenges'
    ],
    techStack: ['Sucafina platform', 'Direct trade systems', 'Quality assessment tools'],
    linkedinUrl: 'https://linkedin.com/company/sucafina',
    website: 'https://www.sucafina.com',
    estimatedArbitrageVolume: 200,
    commissionPotential: 200
  },
  {
    id: 'volcafe',
    name: 'Volcafe',
    revenue: 1500000000,
    commodities: ['coffee'],
    headquarters: 'Winterthur, Switzerland',
    tier: 'tier3',
    decisionMakers: [
      {
        name: 'Ted van der Zalm',
        title: 'CEO',
        linkedin: 'https://linkedin.com/in/ted-van-der-zalm-567890',
        priority: 'high',
        influence: 'decision'
      }
    ],
    painPoints: [
      'Coffee futures basis risk',
      'Warehouse financing costs',
      'Quality arbitrage timing',
      'Origin payment delays',
      'Currency hedging inefficiencies'
    ],
    techStack: ['Volcafe Way platform', 'ED&F Man systems', 'Traditional coffee trading'],
    linkedinUrl: 'https://linkedin.com/company/volcafe',
    website: 'https://www.volcafe.com',
    estimatedArbitrageVolume: 150,
    commissionPotential: 150
  }
];

// AI-Powered Lead Scoring Algorithm
export const calculateLeadScore = (company: TargetCompany): number => {
  let score = 0;
  
  // Revenue scoring (40%)
  if (company.revenue > 100000000000) score += 40;
  else if (company.revenue > 10000000000) score += 30;
  else if (company.revenue > 1000000000) score += 20;
  else score += 10;
  
  // Pain point intensity (30%)
  const painPointScore = company.painPoints.length * 6;
  score += Math.min(painPointScore, 30);
  
  // Tech readiness (20%)
  const hasBlockchain = company.techStack.some(tech => 
    tech.toLowerCase().includes('blockchain') || 
    tech.toLowerCase().includes('pilot')
  );
  score += hasBlockchain ? 20 : 10;
  
  // Commission potential (10%)
  if (company.commissionPotential > 1000) score += 10;
  else if (company.commissionPotential > 500) score += 7;
  else if (company.commissionPotential > 100) score += 5;
  else score += 2;
  
  return Math.min(score, 100);
};

// Priority segmentation
export const getPriorityCompanies = () => {
  return targetCompanies
    .map(company => ({
      ...company,
      leadScore: calculateLeadScore(company),
      estimatedROI: (company.commissionPotential * 12) / 500 // Assuming $500K CAC
    }))
    .sort((a, b) => b.leadScore - a.leadScore);
};