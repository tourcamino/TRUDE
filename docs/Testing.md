# Testing & CI

This document summarizes the testing setup and how to run it locally and in CI.

## Hardhat
- Script principali:
  - `npm run hh:compile`
  - `npm run hh:test:smoke`
  - `npm run hh:test:affiliate`
  - `npm run hh:test:factory-admin`
  - `npm run hh:test:vault-edgecases`
  - `npm run hh:test:withdraw`
  - `npm run hh:test:trude-vault`
  - `npm run hh:test:all` (esegue in sequenza tutti i test)
- Coverage:
  - Plugin: `solidity-coverage`
  - Command: `npm run hh:coverage`
  - Reports: `TRUDE/coverage/index.html`, `TRUDE/coverage/lcov-report/`
- Windows notes:
  - On Windows Mocha/Node may show a `libuv` crash at the end; coverage reports are still generated. In CI (Ubuntu) this does not occur.

- ## Foundry
- Configuration: `TRUDE/foundry.toml`
- npm scripts:
  - `npm run forge:build`
  - `npm run forge:test`
- Installation (Git Bash):
  ```bash
  curl -L https://foundry.paradigm.xyz | bash && source ~/.bashrc && foundryup
  ```
- Verification:
  - `forge --version`

- ## CI (GitHub Actions)
- Workflow: `TRUDE/.github/workflows/tests.yml`
- Runs on Ubuntu:
  - Hardhat: compile, test, coverage
  - Foundry: build, test

## TypeScript types for tests
- Dedicated TS projects:
  - `TRUDE/tsconfig.tests.json` (includes `test/**/*.ts`, `test/**/*.tsx`)
  - `TRUDE/test/tsconfig.json` (override of `exclude` to not exclude tests)
- Included types:
  - `node`, `mocha`, `chai`, `@nomicfoundation/hardhat-chai-matchers`, `@nomicfoundation/hardhat-ethers`
- Settings:
  - `strict: false`, `noUncheckedIndexedAccess: false`, `noEmit: true`

## Docker
- Docker has been excluded from the project and the directory `TRUDE/docker/` removed.
- Any references to Docker will be updated progressively where necessary.
