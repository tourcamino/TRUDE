/* CommonJS Hardhat config to avoid ESM/loader conflicts */
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
try { require("solidity-coverage"); } catch (_) {}
require("dotenv").config();
try { require("hardhat-gas-reporter"); } catch (_) {}
try { require("@nomicfoundation/hardhat-verify"); } catch (_) {}

/** @type import('hardhat/config').HardhatUserConfig */
const viaIR = process.env.SOLC_VIA_IR === "1";
const solcRuns = parseInt(process.env.SOLC_RUNS || "200", 10);
const config = {
  solidity: {
    compilers: [
      { version: "0.8.25", settings: { optimizer: { enabled: true, runs: solcRuns }, viaIR } },
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: solcRuns }, viaIR } },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url:
          process.env.FORK_RPC_URL ||
          process.env.ALCHEMY_RPC_URL ||
          (process.env.ALKEMY_API_KEY
            ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALKEMY_API_KEY}`
            : undefined) ||
          process.env.MORALIS_RPC_URL ||
          "https://eth.llamarpc.com",
        blockNumber: 19500000,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
    },
    op_sepolia: {
      url: process.env.OP_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
      chainId: 11155420,
      accounts: process.env.OP_SEPOLIA_PRIVATE_KEY ? [process.env.OP_SEPOLIA_PRIVATE_KEY] : [],
    },
    base_sepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY ? [process.env.BASE_SEPOLIA_PRIVATE_KEY] : [],
    },
  },
  mocha: {
    require: ["ts-node/register/transpile-only"],
    timeout: 180000,
    exit: true,
  },
};

// Enable JUnit reporter when requested via env
if (process.env.MOCHA_JUNIT) {
  config.mocha.reporter = "mocha-junit-reporter";
  config.mocha.reporterOptions = {
    mochaFile: process.env.HARDHAT_JUNIT_FILE || "reports/hardhat-junit.xml",
  };
}

// Gas reporter optional via env
config.gasReporter = {
  enabled: process.env.GAS_REPORT === "1",
  currency: "USD",
  coinmarketcap: process.env.CMC_API_KEY,
  showMethodSig: true,
  noColors: true,
  showTimeSpent: true,
  outputFile: process.env.GAS_REPORT_FILE || "reports/gas-report.txt",
  // token left default (ETH); OP-specific pricing may require custom gasPriceApi
};

// Etherscan verification (standard + custom chains)
config.etherscan = {
  apiKey: {
    sepolia: process.env.SEPOLIA_ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
    op_sepolia: process.env.OP_SEPOLIA_ETHERSCAN_API_KEY || "",
    base_sepolia: process.env.BASESCAN_API_KEY || process.env.BASE_SEPOLIA_ETHERSCAN_API_KEY || "",
  },
  customChains: [
    {
      network: "op_sepolia",
      chainId: 11155420,
      urls: {
        apiURL: "https://api-sepolia-optimism.etherscan.io/api",
        browserURL: "https://sepolia-optimism.etherscan.io",
      },
    },
    {
      network: "base_sepolia",
      chainId: 84532,
      urls: {
        apiURL: "https://api-sepolia.basescan.org/api",
        browserURL: "https://sepolia.basescan.org",
      },
    },
  ],
};

module.exports = config;