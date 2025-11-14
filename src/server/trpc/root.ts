import {
  createCallerFactory,
  createTRPCRouter,
} from "./main";

// Core TRuDe business logic
import { createVault } from "./procedures/createVault";
import { createDeposit } from "./procedures/createDeposit";
import { registerProfit } from "./procedures/registerProfit";
import { requestWithdrawCapital } from "./procedures/requestWithdrawCapital";
import { finalizeWithdrawCapital } from "./procedures/finalizeWithdrawCapital";
import { getRevenueMetrics } from "./procedures/getRevenueMetrics";
import { preparePermitTypedData, preparePermitAndDeposit } from "./procedures/preparePermitAndDeposit";
import { getRevenueByAffiliate } from "./procedures/getRevenueByAffiliate";
import { getRevenueByVault } from "./procedures/getRevenueByVault";
import { getRevenueTimeseries } from "./procedures/getRevenueTimeseries";
import { exportAffiliatesCSV } from "./procedures/exportAffiliatesCSV";
import { exportUsersCSV } from "./procedures/exportUsersCSV";
import { exportUserCSV } from "./procedures/exportUserCSV";

// Vault management
import { getVaults } from "./procedures/getVaults";
import { getVaultById } from "./procedures/getVaultById";
import { getVaultMetrics } from "./procedures/getVaultMetrics";
import { getVaultEvents } from "./procedures/getVaultEvents";
import { deleteVault } from "./procedures/deleteVault";
import { pauseVault } from "./procedures/pauseVault";
import { pauseVaultOnChain } from "./procedures/pauseVaultOnChain";
import { syncVaultEvents } from "./procedures/syncVaultEvents";

// Transaction procedures
import { prepareDeposit } from "./procedures/prepareDeposit";
import { finalizeDeposit } from "./procedures/finalizeDeposit";
import { withdrawCapital } from "./procedures/withdrawCapital";
import { withdrawProfit } from "./procedures/withdrawProfit";
import { finalizeWithdrawProfit } from "./procedures/finalizeWithdrawProfit";
import { finalizeProfitWithdrawal } from "./procedures/finalizeProfitWithdrawal";

// Affiliate procedures
import { registerAffiliate } from "./procedures/registerAffiliate";
import { finalizeRegisterAffiliate } from "./procedures/finalizeRegisterAffiliate";
import { getAffiliateStats } from "./procedures/getAffiliateStats";
import { requestWithdrawAffiliateEarnings } from "./procedures/requestWithdrawAffiliateEarnings";
import { finalizeWithdrawAffiliateEarnings } from "./procedures/finalizeWithdrawAffiliateEarnings";

// Admin procedures
import { getDashboardStats } from "./procedures/getDashboardStats";
import { getFactorySettings } from "./procedures/getFactorySettings";
import { updateFactorySettings } from "./procedures/updateFactorySettings";
import { prepareUpdateFactorySettingsOnChain } from "./procedures/prepareUpdateFactorySettingsOnChain";
import { deleteAllVaults } from "./procedures/deleteAllVaults";
import { pauseAllVaults } from "./procedures/pauseAllVaults";
import { getUserDashboard } from "./procedures/getUserDashboard";

// Utility procedures
import { getTokenPrices } from "./procedures/getTokenPrices";
import { getChainInfo } from "./procedures/getChainInfo";
import { healthCheck } from "./procedures/healthCheck";
import { connectWallet } from "./procedures/connectWallet";

// API Showcase procedures (for demonstration)
import { getUsers, getUserById, getPosts, getApiStats } from "./procedures/apiShowcase/getExamples";
import { createUser, updateUser, deleteUser, createPost, likePost } from "./procedures/apiShowcase/mutationExamples";
import { simulateNetworkError, simulateAuthError, simulateValidationError, simulateNotFoundError } from "./procedures/apiShowcase/errorExamples";

// AI procedures
import { aiHealthCheck, aiFinancialAnalysis, aiChat, aiCommonQuestions, aiReport } from "./procedures/ai";
import { 
  aiMarketAnalysis, 
  aiExecutionOptimization, 
  aiExecuteOrder, 
  aiExecutionMetrics, 
  aiFeeOptimizer, 
  aiSentimentAnalysis 
} from "./procedures/ai-execution";

// Strategy Engine procedures
import { strategyRouter } from "./procedures/strategyEngine";

// TruDe Adapters
import { universalYieldAdapter } from "./procedures/universalYieldAdapter";
import { crossChainArbitrageAdapter, executeArbitrageTrade } from "./procedures/crossChainArbitrageAdapter";
import { stablecoinFarmingAdapter, harvestFarmingRewards } from "./procedures/stablecoinFarmingAdapter";
// import { validateSecurity, getSecurityMetrics } from "./procedures/securityValidation";
// import { 
//   createProfitVerification, 
//   updateProfitVerification, 
//   getProfitVerificationReport, 
//   getPendingVerifications 
// } from "./procedures/profitVerification";

// Create sub-routers
const coreRouter = createTRPCRouter({
  createVault,
  createDeposit,
  registerProfit,
  requestWithdrawCapital,
  finalizeWithdrawCapital,
  getRevenueMetrics,
  preparePermitTypedData,
  preparePermitAndDeposit,
  getRevenueByAffiliate,
  getRevenueByVault,
  getRevenueTimeseries,
  exportAffiliatesCSV,
  exportUsersCSV,
  exportUserCSV,
});

const vaultRouter = createTRPCRouter({
  getVaults,
  getVaultById,
  getVaultMetrics,
  getVaultEvents,
  deleteVault,
  pauseVault,
  pauseVaultOnChain,
  syncVaultEvents,
});

const transactionRouter = createTRPCRouter({
  prepareDeposit,
  finalizeDeposit,
  withdrawCapital,
  withdrawProfit,
  finalizeWithdrawProfit,
  finalizeProfitWithdrawal,
});

const affiliateRouter = createTRPCRouter({
  registerAffiliate,
  finalizeRegisterAffiliate,
  getAffiliateStats,
  requestWithdrawAffiliateEarnings,
  finalizeWithdrawAffiliateEarnings,
});

const adminRouter = createTRPCRouter({
  getDashboardStats,
  getFactorySettings,
  updateFactorySettings,
  prepareUpdateFactorySettingsOnChain,
  deleteAllVaults,
  pauseAllVaults,
  getUserDashboard,
});

const utilityRouter = createTRPCRouter({
  getTokenPrices,
  getChainInfo,
  healthCheck,
  connectWallet,
});

const apiShowcaseRouter = createTRPCRouter({
  getUsers,
  getUserById,
  getPosts,
  getApiStats,
  createUser,
  updateUser,
  deleteUser,
  createPost,
  likePost,
  simulateNetworkError,
  simulateAuthError,
  simulateValidationError,
  simulateNotFoundError,
});

const aiRouter = createTRPCRouter({
  healthCheck: aiHealthCheck,
  financialAnalysis: aiFinancialAnalysis,
  chat: aiChat,
  commonQuestions: aiCommonQuestions,
  report: aiReport,
  marketAnalysis: aiMarketAnalysis,
  executionOptimization: aiExecutionOptimization,
  executeOrder: aiExecuteOrder,
  executionMetrics: aiExecutionMetrics,
  feeOptimizer: aiFeeOptimizer,
  sentimentAnalysis: aiSentimentAnalysis,
});

const adapterRouter = createTRPCRouter({
  universalYield: universalYieldAdapter,
  crossChainArbitrage: crossChainArbitrageAdapter,
  executeArbitrageTrade,
  stablecoinFarming: stablecoinFarmingAdapter,
  harvestFarmingRewards,
  // validateSecurity,
  // getSecurityMetrics,
  // createProfitVerification,
  // updateProfitVerification,
  // getProfitVerificationReport,
  // getPendingVerifications,
});

// Main router
export const appRouter = createTRPCRouter({
  core: coreRouter,
  vault: vaultRouter,
  transaction: transactionRouter,
  affiliate: affiliateRouter,
  admin: adminRouter,
  utility: utilityRouter,
  apiShowcase: apiShowcaseRouter,
  ai: aiRouter,
  strategy: strategyRouter,
  adapter: adapterRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
