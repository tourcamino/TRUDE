import { createCallerFactory, createTRPCRouter } from "./main";
import { createVault } from "./procedures/createVault";
import { createDeposit } from "./procedures/createDeposit";
import { registerProfit } from "./procedures/registerProfit";
import { requestWithdrawCapital } from "./procedures/requestWithdrawCapital";
import { finalizeWithdrawCapital } from "./procedures/finalizeWithdrawCapital";
import { getRevenueMetrics } from "./procedures/getRevenueMetrics";
import { getRevenueByAffiliate } from "./procedures/getRevenueByAffiliate";
import { getRevenueByVault } from "./procedures/getRevenueByVault";
import { getRevenueTimeseries } from "./procedures/getRevenueTimeseries";

export const appRouter = createTRPCRouter({
  createVault,
  createDeposit,
  registerProfit,
  requestWithdrawCapital,
  finalizeWithdrawCapital,
  getRevenueMetrics,
  getRevenueByAffiliate,
  getRevenueByVault,
  getRevenueTimeseries,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);