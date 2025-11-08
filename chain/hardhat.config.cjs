// Plugins intentionally omitted to avoid ESM subpath resolution issues.

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: '0.8.20' }, { version: '0.8.21' }],
  },
  paths: {
    sources: '../contracts',
    tests: '../test',
    cache: './cache',
    artifacts: './artifacts',
  },
};