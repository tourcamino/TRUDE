import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getFactorySettings = baseProcedure.query(async () => {
  try {
    let settings = await db.factorySettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      // Configured for stablecoins in the Ethereum environment (e.g., USDC with 6 decimals)
      settings = await db.factorySettings.create({
        data: {
          minDeposit: "10000000", // 10 USDC (6 decimals)
          affiliateShareBps: 5000,
          maxFeePercent: 20,
          isPaused: false,
        },
      });
    }

    return settings;
  } catch (err) {
    console.error("getFactorySettings failed:", err);
    // Provide sane defaults when the database is unavailable
    return {
      id: 0,
      minDeposit: "10000000",
      affiliateShareBps: 5000,
      maxFeePercent: 20,
      isPaused: false,
      updatedAt: new Date(),
    };
  }
});
