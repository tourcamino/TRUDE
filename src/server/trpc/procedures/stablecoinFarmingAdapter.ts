import { z } from 'zod';
import { baseProcedure } from '../main';
import { TRPCError } from '@trpc/server';

// Stablecoin farming protocols
const PROTOCOLS = {
  CURVE: {
    name: 'Curve Finance',
    baseAPY: 0.025, // 2.5% base APY
    crvRewards: 0.015, // 1.5% CRV rewards
    riskLevel: 2,
  },
  CONVEX: {
    name: 'Convex Finance',
    baseAPY: 0.028, // 2.8% base APY
    cvxRewards: 0.022, // 2.2% CVX rewards
    boostedAPY: 0.035, // 3.5% boosted
    riskLevel: 3,
  },
  YEARN: {
    name: 'Yearn Finance',
    baseAPY: 0.032, // 3.2% base APY
    autoCompound: true,
    riskLevel: 4,
  },
} as const;

// Security manager for stablecoin farming
class StablecoinFarmingSecurityManager {
  static readonly MAX_DEPOSIT = 50000; // $50k max per protocol
  static readonly MIN_DEPOSIT = 100; // $100 minimum
  static readonly MAX_TOTAL_EXPOSURE = 100000; // $100k max across all protocols
  static readonly EMERGENCY_WITHDRAW_THRESHOLD = 0.95; // 95% of deposit

  static validateDepositAmount(amount: number, currentExposure: number): boolean {
    return amount >= this.MIN_DEPOSIT && 
           amount <= this.MAX_DEPOSIT && 
           (currentExposure + amount) <= this.MAX_TOTAL_EXPOSURE;
  }

  static validateProtocolRisk(protocol: keyof typeof PROTOCOLS, userRiskLevel: string): boolean {
    const protocolRisk = PROTOCOLS[protocol].riskLevel;
    const maxAllowedRisk = userRiskLevel === 'conservative' ? 2 : 
                          userRiskLevel === 'moderate' ? 4 : 10;
    return protocolRisk <= maxAllowedRisk;
  }

  static calculateImpermanentLossRisk(depositToken: string, poolComposition: any): number {
    // Simplified IL risk calculation
    if (depositToken.includes('3C') || depositToken.includes('3pool')) {
      return 0.1; // Very low IL risk for 3-pool
    }
    if (depositToken.includes('2C')) {
      return 0.3; // Low IL risk for 2-pool
    }
    return 0.5; // Medium IL risk for exotic pools
  }

  static validateEmergencyWithdraw(amount: number, depositAmount: number): boolean {
    return amount <= depositAmount * this.EMERGENCY_WITHDRAW_THRESHOLD;
  }
}

// Farming position schema
const FarmingPositionSchema = z.object({
  protocol: z.enum(['CURVE', 'CONVEX', 'YEARN']),
  pool: z.string(),
  depositToken: z.string(),
  amount: z.number(),
  currentAPY: z.number(),
  rewards: z.object({
    crv: z.number().optional(),
    cvx: z.number().optional(),
    autoCompound: z.boolean().optional(),
  }).optional(),
  depositTime: z.number(),
  lastHarvest: z.number().optional(),
  impermanentLoss: z.number(),
});

// Stablecoin farming adapter
export const stablecoinFarmingAdapter = baseProcedure
  .input(z.object({
    investmentAmount: z.number().min(100).max(50000),
    stablecoin: z.enum(['USDC', 'USDT', 'DAI', 'USDE']).default('USDC'),
    protocols: z.array(z.enum(['CURVE', 'CONVEX', 'YEARN'])).optional(),
    riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).default('conservative'),
    autoHarvest: z.boolean().default(true),
    diversification: z.boolean().default(true),
  }))
  .output(z.object({
    recommendedStrategy: z.object({
      allocations: z.array(z.object({
        protocol: z.enum(['CURVE', 'CONVEX', 'YEARN']),
        pool: z.string(),
        amount: z.number(),
        expectedAPY: z.number(),
        riskScore: z.number(),
      })),
      totalExpectedAPY: z.number(),
      totalRiskScore: z.number(),
      impermanentLossRisk: z.number(),
    }),
    positions: z.array(FarmingPositionSchema),
    projectedReturns: z.object({
      daily: z.number(),
      weekly: z.number(),
      monthly: z.number(),
      yearly: z.number(),
    }),
    securityAnalysis: z.object({
      riskLevel: z.string(),
      warnings: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    auditTrail: z.array(z.object({
      timestamp: z.number(),
      action: z.string(),
      details: z.object({}).passthrough(),
    })),
  }))
  .mutation(async ({ input }) => {
    const auditTrail: any[] = [];
    const startTime = Date.now();

    try {
      auditTrail.push({
        timestamp: startTime,
        action: 'STABLECOIN_FARMING_ANALYSIS_INITIATED',
        details: { 
          amount: input.investmentAmount, 
          stablecoin: input.stablecoin, 
          riskLevel: input.riskLevel,
          diversification: input.diversification 
        },
      });

      // Validate investment amount
      const currentExposure = 0; // Would track from database in production
      if (!StablecoinFarmingSecurityManager.validateDepositAmount(input.investmentAmount, currentExposure)) {
        throw new Error('Investment amount exceeds security limits');
      }

      // Protocol selection based on risk level
      const availableProtocols = input.protocols || ['CURVE', 'CONVEX', 'YEARN'];
      const validProtocols = availableProtocols.filter(protocol => 
        StablecoinFarmingSecurityManager.validateProtocolRisk(protocol, input.riskLevel)
      );

      if (validProtocols.length === 0) {
        throw new Error('No protocols available for selected risk level');
      }

      // Generate farming strategy
      let allocations: any[] = [];
      let totalExpectedAPY = 0;
      let totalRiskScore = 0;

      if (input.diversification && validProtocols.length > 1) {
        // Diversified strategy
        const allocationPerProtocol = input.investmentAmount / validProtocols.length;
        
        for (const protocol of validProtocols) {
          const pool = getOptimalPool(protocol, input.stablecoin);
          const expectedAPY = calculateProtocolAPY(protocol, pool);
          const riskScore = PROTOCOLS[protocol].riskLevel;

          allocations.push({
            protocol,
            pool,
            amount: allocationPerProtocol,
            expectedAPY,
            riskScore,
          });

          totalExpectedAPY += expectedAPY * (allocationPerProtocol / input.investmentAmount);
          totalRiskScore += riskScore * (allocationPerProtocol / input.investmentAmount);
        }
      } else {
        // Single protocol strategy (highest APY)
        const bestProtocol = validProtocols.reduce((best, current) => {
          const bestAPY = calculateProtocolAPY(best, getOptimalPool(best, input.stablecoin));
          const currentAPY = calculateProtocolAPY(current, getOptimalPool(current, input.stablecoin));
          return currentAPY > bestAPY ? current : best;
        });

        const pool = getOptimalPool(bestProtocol, input.stablecoin);
        const expectedAPY = calculateProtocolAPY(bestProtocol, pool);

        allocations.push({
          protocol: bestProtocol,
          pool,
          amount: input.investmentAmount,
          expectedAPY,
          riskScore: PROTOCOLS[bestProtocol].riskLevel,
        });

        totalExpectedAPY = expectedAPY;
        totalRiskScore = PROTOCOLS[bestProtocol].riskLevel;
      }

      // Calculate impermanent loss risk
      const impermanentLossRisk = allocations.reduce((total, allocation) => {
        const weight = allocation.amount / input.investmentAmount;
        const ilRisk = StablecoinFarmingSecurityManager.calculateImpermanentLossRisk(
          allocation.pool, 
          { tokenA: input.stablecoin, tokenB: 'USDT' }
        );
        return total + (ilRisk * weight);
      }, 0);

      // Generate mock positions for demonstration
      const positions = allocations.map(allocation => ({
        protocol: allocation.protocol,
        pool: allocation.pool,
        depositToken: input.stablecoin,
        amount: allocation.amount,
        currentAPY: allocation.expectedAPY,
        rewards: allocation.protocol === 'CURVE' ? { crv: allocation.amount * 0.015 } :
                allocation.protocol === 'CONVEX' ? { cvx: allocation.amount * 0.022 } :
                { autoCompound: true },
        depositTime: Date.now(),
        lastHarvest: input.autoHarvest ? Date.now() - 86400000 : undefined, // 24h ago
        impermanentLoss: impermanentLossRisk * 0.1, // 10% of IL risk as actual loss
      }));

      // Calculate projected returns
      const projectedReturns = {
        daily: input.investmentAmount * (totalExpectedAPY / 365),
        weekly: input.investmentAmount * (totalExpectedAPY / 52),
        monthly: input.investmentAmount * (totalExpectedAPY / 12),
        yearly: input.investmentAmount * totalExpectedAPY,
      };

      // Security analysis
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (totalRiskScore > 6) {
        warnings.push('High risk score - consider reducing exposure');
      }
      if (impermanentLossRisk > 0.3) {
        warnings.push('Significant impermanent loss risk detected');
      }
      if (input.investmentAmount > 25000) {
        warnings.push('Large deposit - consider splitting across multiple transactions');
      }

      if (input.riskLevel === 'conservative' && validProtocols.includes('YEARN')) {
        recommendations.push('Consider Yearn for auto-compounding and lower maintenance');
      }
      if (input.diversification && allocations.length < 3) {
        recommendations.push('Add more protocols for better diversification');
      }
      if (!input.autoHarvest) {
        recommendations.push('Enable auto-harvest for optimal compounding');
      }

      auditTrail.push({
        timestamp: Date.now(),
        action: 'STABLECOIN_FARMING_STRATEGY_GENERATED',
        details: {
          allocations: allocations.length,
          totalExpectedAPY: `${(totalExpectedAPY * 100).toFixed(2)}%`,
          totalRiskScore,
          impermanentLossRisk: `${(impermanentLossRisk * 100).toFixed(1)}%`,
          projectedYearlyReturn: projectedReturns.yearly,
        },
      });

      return {
        recommendedStrategy: {
          allocations,
          totalExpectedAPY,
          totalRiskScore,
          impermanentLossRisk,
        },
        positions,
        projectedReturns,
        securityAnalysis: {
          riskLevel: input.riskLevel,
          warnings,
          recommendations,
        },
        auditTrail,
      };

    } catch (error) {
      auditTrail.push({
        timestamp: Date.now(),
        action: 'STABLECOIN_FARMING_ANALYSIS_FAILED',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stablecoin farming analysis failed',
        cause: error,
      });
    }
  });

// Harvest rewards
export const harvestFarmingRewards = baseProcedure
  .input(z.object({
    positionId: z.string(),
    protocol: z.enum(['CURVE', 'CONVEX', 'YEARN']),
    walletAddress: z.string(),
  }))
  .output(z.object({
    harvestedAmount: z.number(),
    transactionHash: z.string(),
    gasUsed: z.number(),
    newAPY: z.number(),
    auditLog: z.object({
      timestamp: z.number(),
      action: z.string(),
      details: z.object({}).passthrough(),
    }),
  }))
  .mutation(async ({ input }) => {
    try {
      // Simulate harvest
      const harvestedAmount = 50 + Math.random() * 200; // $50-250 in rewards
      const gasUsed = input.protocol === 'CURVE' ? 15 : 
                     input.protocol === 'CONVEX' ? 20 : 12;
      
      const transactionHash = '0x' + Array.from({length: 64}, () => 
        '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

      const newAPY = calculateProtocolAPY(input.protocol, 'auto');

      const auditLog = {
        timestamp: Date.now(),
        action: 'FARMING_REWARDS_HARVESTED',
        details: {
          positionId: input.positionId,
          protocol: input.protocol,
          harvestedAmount,
          gasUsed,
          newAPY: `${(newAPY * 100).toFixed(2)}%`,
          walletAddress: input.walletAddress,
        },
      };

      return {
        harvestedAmount,
        transactionHash,
        gasUsed,
        newAPY,
        auditLog,
      };

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Harvest failed',
        cause: error,
      });
    }
  });

// Helper functions
function getOptimalPool(protocol: keyof typeof PROTOCOLS, stablecoin: string): string {
  switch (protocol) {
    case 'CURVE':
      return stablecoin === 'USDC' ? '3Crv' : 
             stablecoin === 'USDT' ? '3Crv' : 
             stablecoin === 'DAI' ? '3Crv' : '3Crv';
    case 'CONVEX':
      return stablecoin === 'USDC' ? 'cvx3Crv' : 
             stablecoin === 'USDT' ? 'cvx3Crv' : 
             stablecoin === 'DAI' ? 'cvx3Crv' : 'cvx3Crv';
    case 'YEARN':
      return stablecoin === 'USDC' ? 'yvUSDC' : 
             stablecoin === 'USDT' ? 'yvUSDT' : 
             stablecoin === 'DAI' ? 'yvDAI' : 'yvUSDC';
    default:
      return '3Crv';
  }
}

function calculateProtocolAPY(protocol: keyof typeof PROTOCOLS, pool: string): number {
  const baseAPY = PROTOCOLS[protocol].baseAPY;
  
  switch (protocol) {
    case 'CURVE':
      return baseAPY + PROTOCOLS.CURVE.crvRewards;
    case 'CONVEX':
      return baseAPY + PROTOCOLS.CONVEX.cvxRewards + (pool.includes('3Crv') ? 0.005 : 0);
    case 'YEARN':
      return baseAPY + (pool.includes('yv') ? 0.008 : 0); // Auto-compounding bonus
    default:
      return baseAPY;
  }
}