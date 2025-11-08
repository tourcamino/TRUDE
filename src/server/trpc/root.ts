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
import { registerAffiliate } from "./procedures/registerAffiliate";
import { getAffiliateStats } from "./procedures/getAffiliateStats";
import { getDashboardStats } from "./procedures/getDashboardStats";
import { getUserDashboard } from "./procedures/getUserDashboard";
import { connectWallet } from "./procedures/connectWallet";
import { pauseVault } from "./procedures/pauseVault";
import { deleteVault } from "./procedures/deleteVault";

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
  deleteVault,
  
  // Deposits and profits
  createDeposit,
  registerProfit,
  withdrawProfit,
  
  // Affiliates
  registerAffiliate,
  getAffiliateStats,
  
  // Dashboard
  getDashboardStats,
  getUserDashboard,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
