# Testing & CI

Questo documento riassume il setup di testing e come eseguirlo localmente e in CI.

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
  - Comando: `npm run hh:coverage`
  - Report: `TRUDE/coverage/index.html`, `TRUDE/coverage/lcov-report/`
- Note Windows:
  - Su Windows Mocha/Node può mostrare un crash `libuv` al termine; i report di coverage vengono comunque generati. In CI (Ubuntu) non si verifica.

## Foundry
- Configurazione: `TRUDE/foundry.toml`
- Script npm:
  - `npm run forge:build`
  - `npm run forge:test`
- Installazione (Git Bash):
  ```bash
  curl -L https://foundry.paradigm.xyz | bash && source ~/.bashrc && foundryup
  ```
- Verifica:
  - `forge --version`

## CI (GitHub Actions)
- Workflow: `TRUDE/.github/workflows/tests.yml`
- Esegue su Ubuntu:
  - Hardhat: compile, test, coverage
  - Foundry: build, test

## Tipi TypeScript per i test
- Progetti TS dedicati:
  - `TRUDE/tsconfig.tests.json` (include `test/**/*.ts`, `test/**/*.tsx`)
  - `TRUDE/test/tsconfig.json` (override di `exclude` per non escludere i test)
- Tipi inclusi:
  - `node`, `mocha`, `chai`, `@nomicfoundation/hardhat-chai-matchers`, `@nomicfoundation/hardhat-ethers`
- Impostazioni:
  - `strict: false`, `noUncheckedIndexedAccess: false`, `noEmit: true`

## Docker
- Docker è stato escluso dal progetto e la directory `TRUDE/docker/` rimossa.
- Eventuali riferimenti a Docker verranno aggiornati progressivamente dove necessario.