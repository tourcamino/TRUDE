/**
 * Truffle configuration (ESM) for local development.
 * Mirrors the CommonJS config but exported as ESM for type:"module" projects.
 */
const config = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.25",
      settings: {
        optimizer: { enabled: true, runs: 200 },
      },
    },
  },
};

export default config;