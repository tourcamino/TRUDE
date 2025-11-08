import { db } from "~/server/db";

async function setup() {
  console.log("Starting database setup...");
  console.log("Note: This system is designed for stablecoins within the Ethereum environment");

  // Ensure FactorySettings exists
  const existingSettings = await db.factorySettings.findFirst();
  if (!existingSettings) {
    await db.factorySettings.create({
      data: {
        minDeposit: "10000000", // 10 USDC (6 decimals) - reasonable minimum for stablecoin deposits
        affiliateShareBps: 5000, // 50%
        maxFeePercent: 20, // 20%
        isPaused: false,
      },
    });
    console.log("✓ Created default FactorySettings (configured for stablecoins)");
  } else {
    console.log("✓ FactorySettings already exists");
  }

  // Create test user for the owner address if it doesn't exist
  const ownerAddress = "0x452d4695dbe0828bde8e8ddd4b836551d6bb8351";
  let ownerUser = await db.user.findUnique({
    where: { address: ownerAddress },
  });

  if (!ownerUser) {
    ownerUser = await db.user.create({
      data: { address: ownerAddress },
    });
    console.log("✓ Created test user for owner address");
  } else {
    console.log("✓ Owner user already exists");
  }

  // Create USDC test vault if it doesn't exist
  // USDC is a widely-used stablecoin in the Ethereum environment
  const testVaultAddress = "0x19df0ce99c905021b6f6ea0a7d82033dcf9ccefa";
  const existingVault = await db.vault.findUnique({
    where: { address: testVaultAddress },
  });

  if (!existingVault) {
    await db.vault.create({
      data: {
        address: testVaultAddress,
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum mainnet
        tokenSymbol: "USDC",
        ownerAddress: ownerAddress,
        ledgerAddress: "0x1234567890123456789012345678901234567890",
        totalValueLocked: "0",
        isPaused: false,
      },
    });
    console.log("✓ Created USDC test vault (stablecoin)");
  } else {
    console.log("✓ USDC test vault already exists");
  }

  console.log("Database setup complete!");
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
