import {
  createCallerFactory,
  createTRPCRouter,
} from "~/server/trpc/main";
import { getFactorySettings } from "./procedures/getFactorySettings";
import { updateFactorySettings } from "./procedures/updateFactorySettings";
import { createVault } from "./procedures/createVault";
import { getVaults } from "./procedures/getVaults";
import { getVaultById } from "./procedures/getVaultById";
import { createDeposit } from "./procedures/createDeposit";
import { registerProfit } from "./procedures/registerProfit";
import { withdrawProfit } from "./procedures/withdrawProfit";
import { finalizeProfitWithdrawal } from "./procedures/finalizeProfitWithdrawal";
import { registerAffiliate } from "./procedures/registerAffiliate";
import { getAffiliateStats } from "./procedures/getAffiliateStats";
import { getDashboardStats } from "./procedures/getDashboardStats";
import { getUserDashboard } from "./procedures/getUserDashboard";
import { connectWallet } from "./procedures/connectWallet";
import { pauseVault } from "./procedures/pauseVault";
import { pauseAllVaults } from "./procedures/pauseAllVaults";
import { deleteVault } from "./procedures/deleteVault";
import { withdrawCapital } from "./procedures/withdrawCapital";
import { requestWithdrawCapital } from "./procedures/requestWithdrawCapital";
import { finalizeWithdrawCapital } from "./procedures/finalizeWithdrawCapital";
import { deleteAllVaults } from "./procedures/deleteAllVaults";
import { getTokenPrices } from "./procedures/getTokenPrices";
import { healthCheck } from "./procedures/healthCheck";
import { getVaultMetrics } from "./procedures/getVaultMetrics";
import { registerServiceDelegation } from "./procedures/registerServiceDelegation";

export const appRouter = createTRPCRouter({
  // Wallet
  connectWallet,
  
  // Factory settings
  getFactorySettings,
  updateFactorySettings,
  
  // Vault management
  createVault,
  getVaults,
  getVaultById,
  pauseVault,
  pauseAllVaults,
  deleteVault,
  deleteAllVaults,
  
  // Deposits and profits
  createDeposit,
  registerProfit,
  withdrawProfit,
  finalizeProfitWithdrawal,
  withdrawCapital,
  requestWithdrawCapital,
  finalizeWithdrawCapital,
  
  // Market data
  getTokenPrices,
  
  // Health
  healthCheck,
  
  // Affiliates
  registerAffiliate,
  getAffiliateStats,
  
  // Dashboard
  getDashboardStats,
  getUserDashboard,
  getVaultMetrics,
  // Service delegation
  registerServiceDelegation,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
