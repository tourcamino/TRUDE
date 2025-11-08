/**
 * Truffle configuration for local development.
 * Uses Solidity 0.8.25 and a local Ganache network on 8545.
 */
module.exports = {
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