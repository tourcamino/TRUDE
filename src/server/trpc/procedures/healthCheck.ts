import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { env } from "~/server/env";

export const healthCheck = baseProcedure.query(async () => {
  let dbConnected = false;
  let dbError: string | null = null;

  try {
    // Simple read to validate connectivity
    await db.user.count();
    dbConnected = true;
  } catch (e: any) {
    dbConnected = false;
    dbError = e?.message ?? String(e);
  }

  // WalletConnect project ID may be present on server env too
  const walletConnectProjectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || null;

  return {
    nodeEnv: env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL || null,
    dbConnected,
    dbError,
    walletConnectConfigured: !!walletConnectProjectId,
  };
});