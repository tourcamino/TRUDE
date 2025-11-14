// TruDe Bootstrap Budget - Pre-Funding Reality

export class TruDeBootstrapBudget {
  
  // Budget realistico per arrivare a traction (non $100k)
  static BOOTSTRAP_PHASES = {
    
    // Fase 1: MVP con 10 utenti (Mesi 1-3)
    mvpPhase: {
      timeline: "3 mesi",
      totalBudget: "$8,500",
      
      breakdown: {
        // Development essenziale
        development: {
          smartContract: "$2,000", // Basic contracts only
          frontend: "$1,500", // React + wallet connect
          backend: "$1,000", // Oracle integration
          total: "$4,500"
        },
        
        // Infrastructure minima
        infrastructure: {
          rpcNodes: "$300", // Alchemy/Infura
          oracle: "$200", // Chainlink basic
          hosting: "$100", // Vercel/Netlify
          total: "$600"
        },
        
        // Legal minimo
        legal: {
          entitySetup: "$800", // LLC registration
          basicContracts: "$1,200", // Terms of service
          total: "$2,000"
        },
        
        // Testing e deployment
        deployment: {
          testnet: "$100", // Gas fees
          mainnet: "$200", // Deployment gas
          monitoring: "$100", // Basic monitoring
          total: "$400"
        },
        
        // Contingency
        contingency: "$900", // 10% buffer
        
        totalMonthly: "$2,833"
      }
    },
    
    // Fase 2: Traction con 50 utenti (Mesi 4-6)
    tractionPhase: {
      timeline: "3 mesi", 
      totalBudget: "$12,000",
      
      breakdown: {
        // Product improvement
        development: {
          security: "$3,000", // Basic security measures
          features: "$2,000", // User-requested features
          optimization: "$1,000", // Gas optimization
          total: "$6,000"
        },
        
        // Infrastructure scaling
        infrastructure: {
          scaling: "$800", // Better RPC + monitoring
          support: "$400", // Customer support tools
          analytics: "$300", // User analytics
          total: "$1,500"
        },
        
        // User acquisition organica
        acquisition: {
          content: "$1,000", // Technical blog posts
          partnerships: "$1,500", // Gaming guild partnerships
          community: "$500", // Forum participation
          total: "$3,000"
        },
        
        // Operations
        operations: {
          accounting: "$600", // Bookkeeping
          compliance: "$400", // Basic compliance
          misc: "$500", // Other operational costs
          total: "$1,500"
        },
        
        totalMonthly: "$4,000"
      }
    },
    
    // Totale bootstrap
    totalBootstrap: {
      timeline: "6 mesi",
      totalBudget: "$20,500",
      
      // Obiettivi concreti
      milestones: {
        month1: "MVP funzionante con 3 giochi",
        month2: "10 utenti beta testing",
        month3: "25 utenti attivi, $50k TVL",
        month4: "Security audit basic",
        month5: "50 utenti, $200k TVL", 
        month6: "Metrics per funding round"
      },
      
      // Metrics per funding
      fundingMetrics: {
        users: "50+ attivi",
        tvl: "$200k+",
        revenue: "$2k+ monthly", // 20% di $10k yield
        retention: "60%+ a 3 mesi",
        growth: "20%+ mese-su-mese"
      }
    }
  };
  
  // Audit minimi necessari
  static AUDIT_STRATEGY = {
    
    // Fase 1: Self-audit e community review (gratis)
    selfAudit: {
      cost: "$0",
      timeline: "2 settimane",
      
      activities: [
        "Automated testing completo",
        "Code review interno", 
        "Community developer review",
        "Testnet extensive testing"
      ],
      
      tools: [
        "Slither (static analysis)",
        "MythX (security scanning)",
        "Echidna (fuzzing)",
        "Manual review checklist"
      ]
    },
    
    // Fase 2: Audit economico ($3k-5k)
    budgetAudit: {
      cost: "$4,000",
      timeline: "3 settimane",
      
      companies: [
        {
          name: "SolidProof",
          cost: "$3,000",
          scope: "1-2 contracts",
          timeline: "10 giorni"
        },
        {
          name: "TechRate", 
          cost: "$4,000",
          scope: "3-4 contracts",
          timeline: "14 giorni"
        },
        {
          name: "RD Auditors",
          cost: "$5,000", 
          scope: "5 contracts",
          timeline: "21 giorni"
        }
      ]
    },
    
    // Fase 3: Post-funding audit serio
    premiumAudit: {
      condition: "Dopo funding di $500k+",
      cost: "$15k-25k",
      companies: [
        "Certik",
        "Hacken", 
        "Quantstamp"
      ]
    }
  };
  
  // Revenue projection realistica bootstrap
  static REVENUE_PROJECTION = {
    
    // Mese 1-3: Zero revenue, focus su traction
    phase1: {
      users: "0 → 25",
      tvl: "$0 → $50k",
      revenue: "$0",
      
      // Costi vs revenue
      monthlyCosts: "$2,833",
      monthlyRevenue: "$0",
      netBurn: "$2,833/mese",
      totalBurn: "$8,500"
    },
    
    // Mese 4-6: Inizio revenue
    phase2: {
      users: "25 → 50",
      tvl: "$50k → $200k",
      averageYield: "8% APY",
      
      // Revenue calculation
      monthlyYieldGenerated: "$200k * 8% / 12 = $1,333",
      truDeRevenue: "$1,333 * 20% = $267",
      transactionFees: "$50k volume * 0.5% = $250",
      totalMonthlyRevenue: "$517",
      
      // Costi vs revenue
      monthlyCosts: "$4,000",
      monthlyRevenue: "$517",
      netBurn: "$3,483/mese",
      totalBurn: "$10,450"
    },
    
    // Totale 6 mesi
    total: {
      totalCosts: "$20,500",
      totalRevenue: "$1,550", // Solo ultimi 3 mesi
      netInvestment: "$18,950",
      
      // Cosa ottieni
      users: "50+",
      tvl: "$200k+",
      product: "MVP completo",
      metrics: "Ready for seed round"
    }
  };
  
  // Funding strategy post-bootstrap
  static FUNDING_STRATEGY = {
    
    // Target: Seed round con metrics reali
    seedRound: {
      target: "$400k-600k",
      valuation: "$2M-3M",
      
      // Use of funds
      allocation: {
        team: "$200k", // 2 developers, 6 mesi
        audit: "$50k", // Audit serio
        marketing: "$80k", // Crescita organica
        operations: "$70k", // Legal, compliance, infrastructure
        runway: "$100k", // 12 mesi runway
        total: "$500k"
      },
      
      // Metrics target
      milestones: {
        users: "500+",
        tvl: "$2M+",
        revenue: "$20k+ monthly",
        team: "4 persone",
        product: "Product-market fit"
      }
    },
    
    // Alternative: Pre-seed più piccola
    preSeedRound: {
      target: "$150k-250k",
      valuation: "$1M-1.5M",
      
      // Use of funds
      allocation: {
        team: "$100k", // 1-2 persone
        audit: "$25k", // Audit economico
        growth: "$50k", // User acquisition
        buffer: "$25k", // Contingency
        total: "$200k"
      },
      
      // Obiettivi
      milestones: {
        users: "200+",
        tvl: "$500k+",
        revenue: "$5k+ monthly",
        readyForSeed: "In 6 mesi"
      }
    }
  };
}