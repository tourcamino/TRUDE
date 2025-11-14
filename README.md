# TRUDE

CI badges and workflow artifacts:

- Tests (Hardhat & Truffle): [![Tests](https://github.com/tourcamino/TRUDE/actions/workflows/tests.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/tests.yml)
- Slither: [![Slither](https://github.com/tourcamino/TRUDE/actions/workflows/slither.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/slither.yml)
- Mythril: [![Mythril](https://github.com/tourcamino/TRUDE/actions/workflows/mythril.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/mythril.yml)
- Diligence Fuzzing: [![Diligence Fuzzing](https://github.com/tourcamino/TRUDE/actions/workflows/diligence-fuzzing.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/diligence-fuzzing.yml)
- Echidna: [![Echidna](https://github.com/tourcamino/TRUDE/actions/workflows/echidna.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/echidna.yml)
- Manticore: [![Manticore](https://github.com/tourcamino/TRUDE/actions/workflows/manticore.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/manticore.yml)
- Pre-Deploy Gate (OP Sepolia): [![Pre-Deploy](https://github.com/tourcamino/TRUDE/actions/workflows/pre-deploy.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/pre-deploy.yml)
- Securify2: [![Securify2](https://github.com/tourcamino/TRUDE/actions/workflows/securify2.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/securify2.yml)
- Gas Check: [![Gas Check](https://github.com/tourcamino/TRUDE/actions/workflows/gas-check.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/gas-check.yml)
- OpenZeppelin Sync: [![OpenZeppelin Sync](https://github.com/tourcamino/TRUDE/actions/workflows/openzeppelin-sync.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/openzeppelin-sync.yml)
 - Vercel Deploy: [![Vercel Deploy](https://github.com/tourcamino/TRUDE/actions/workflows/vercel-deploy.yml/badge.svg)](https://github.com/tourcamino/TRUDE/actions/workflows/vercel-deploy.yml)

Generated artifacts (downloadable from the workflow run page):

- Hardhat JUnit: `hardhat-junit-report` (files `reports/hardhat-junit.xml` or `reports/hardhat-smoke-junit.xml`)
- Truffle JUnit: `truffle-junit-report` (files `reports/junit.xml` or `reports/truffle-smoke-junit.xml`)
- Slither SARIF/JSON: `slither-artifacts`
- Mythril JSON: `mythril-report`
- Diligence Fuzzing: output visible in the run logs (requires `FUZZ_API_KEY` in Secrets)
- Manticore: `manticore-report` (directory `mcore_*` for each flattened `.sol`)
- Securify2: `securify2-report` (`.txt` file for each flattened `.sol`)

Note: badges updated for `tourcamino/TRUDE`.

## Parameterized test suite

- Smoke: `workflow_dispatch` input `suite=smoke` (runs `hh:test:smoke:junit` and `truffle:test:smoke:junit`)
- Full: `workflow_dispatch` input `suite=full` (runs `hh:test:junit` and `truffle:test:junit`)

## Local usage

- Hardhat JUnit: `npm run hh:test:junit`
- Hardhat smoke JUnit: `npm run hh:test:smoke:junit`
- Truffle JUnit: `npm run truffle:test:junit`
- Truffle smoke JUnit: `npm run truffle:test:smoke:junit`
- Diligence Fuzzing (CI): add `FUZZ_API_KEY` in repository Secrets and trigger the workflow from the Actions page.
- Manticore (CI): performs symbolic analysis on flattened contracts (no local configuration required).

## Pre-deploy on OP Sepolia

- Required variables:
  - `OP_SEPOLIA_RPC_URL` (e.g., Alchemy/Infura endpoint for Optimism Sepolia)
  - `OP_SEPOLIA_PRIVATE_KEY` (deployer account; handle securely)
  - `OP_SEPOLIA_ETHERSCAN_API_KEY` (for explorer verification)
- Hardhat network: `op_sepolia` (chainId `11155420`)
- Commands:
  - Deploy: `npm run hh:deploy:op-sepolia`
  - Gas report (smoke): `npm run hh:gas`
  - Verify (post-deploy): `npm run hh:verify:op-sepolia <address> [constructorArgs...]`
- Workflow: `Pre-Deploy Gate` (Actions → `pre-deploy.yml`) with input `suite=smoke|full` for aggregated tests/analysis.
- Securify2 (CI): flattens contracts and generates textual reports; no local configuration required.

## Echidna (property-based)

- Workflow: `echidna.yml`, runs harness `EchidnaAffiliateProperties.sol` on affiliate/fee tiering and non-negative TVL.
- Properties covered:
  - `affiliateShareBps <= 10000`
  - `maxFeePercent <= 100`
  - `vault.totalValueLocked() >= 0`

## Gas Check (threshold failures)

- Workflow: `gas-check.yml` — runs Hardhat tests with `hardhat-gas-reporter`, saves `reports/gas-report.txt` and fails if defined thresholds exceed limits.
- Thresholds: `TRUDE/gas-thresholds.json` maps `"Contract#Method" -> gasLimit`. Example:

```
{
  "TrudeVault#deposit": 120000,
  "TrudeVault#withdraw": 150000
}
```

- Script: `TRUDE/scripts/gas-check.js` reads the report, compares the `avg` for each entry and exits with code `1` for violations.
- Local run: `npm run gas:check` (creates `reports/gas-report.txt` and validates thresholds).
- Notes:
  - Only keys present in `gas-thresholds.json` are enforced; entries not present are ignored.
  - Update thresholds based on actual data and desired profile (`SOLC_RUNS`, `SOLC_VIA_IR`).

## English-only content check

- `npm run i18n:check` — verifies English-only content across code, docs and tests.

## GitHub cleanup (single repository)

- Use `npm run github:cleanup` with environment variables:
  - `KEEP_REPO` repository name to preserve
  - `GITHUB_OWNER` your GitHub username or org name
  - `GH_TOKEN` a token with `repo` scope
  - optional `DELETE=1` to delete instead of archive
- Example:
  - `KEEP_REPO=trude GITHUB_OWNER=tuo-utente GH_TOKEN=<token> npm run github:cleanup`

## Deployment (Render)

- Blueprint: `render.yaml` defines a minimal Node web service that builds with `pnpm` and starts via `start:render`.
- Auto deploy: enabled via Render’s GitHub integration, no external deploy API required.
- Health check: `healthCheckPath: /`.
- OpenZeppelin subtree
  - Sync check: `OpenZeppelin Subtree Sync` workflow fails when subtree diverges from upstream.
  - Auto-sync: scheduled job pulls changes from `OpenZeppelin/openzeppelin-contracts` into `openzeppelin-contracts/`.
  - Manual run: trigger the workflow from the Actions tab.

## Health Check

- Endpoint: `GET /api/health` returns `{ ok, nodeEnv, baseUrl, databaseUrlPresent, databaseOk, databasePingMs }` with a minimal DB ping via Prisma.
- ## Deployment (Vercel)

- CI deploy: `.github/workflows/vercel-deploy.yml` builds and deploys using Vercel GitHub Action.
- Required secrets in GitHub:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Project settings: set build command to `pnpm run build` and root to `trude/`.
