# TRUDE

Badge CI e artifact per i workflow:

- Test (Hardhat & Truffle): [![Tests](https://github.com/OWNER/REPO/actions/workflows/tests.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/tests.yml)
- Slither: [![Slither](https://github.com/OWNER/REPO/actions/workflows/slither.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/slither.yml)
- Mythril: [![Mythril](https://github.com/OWNER/REPO/actions/workflows/mythril.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/mythril.yml)
- Diligence Fuzzing: [![Diligence Fuzzing](https://github.com/OWNER/REPO/actions/workflows/diligence-fuzzing.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/diligence-fuzzing.yml)
- Echidna: [![Echidna](https://github.com/OWNER/REPO/actions/workflows/echidna.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/echidna.yml)
- Manticore: [![Manticore](https://github.com/OWNER/REPO/actions/workflows/manticore.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/manticore.yml)
 - Pre-Deploy Gate (OP Sepolia): [![Pre-Deploy](https://github.com/OWNER/REPO/actions/workflows/pre-deploy.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/pre-deploy.yml)
 - Securify2: [![Securify2](https://github.com/OWNER/REPO/actions/workflows/securify2.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/securify2.yml)
 - Gas Check: [![Gas Check](https://github.com/OWNER/REPO/actions/workflows/gas-check.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/gas-check.yml)

Artifact generati (scaricabili dalla pagina del workflow run):

- Hardhat JUnit: `hardhat-junit-report` (file `reports/hardhat-junit.xml` o `reports/hardhat-smoke-junit.xml`)
- Truffle JUnit: `truffle-junit-report` (file `reports/junit.xml` o `reports/truffle-smoke-junit.xml`)
- Slither SARIF/JSON: `slither-artifacts`
- Mythril JSON: `mythril-report`
- Diligence Fuzzing: output visibile nei logs del run (richiede `FUZZ_API_KEY` nei Secrets)
 - Manticore: `manticore-report` (directory `mcore_*` per ciascun `.sol` appiattito)
 - Securify2: `securify2-report` (file `.txt` per ciascun `.sol` appiattito)

Note: sostituisci `OWNER/REPO` con l’organizzazione e nome repository GitHub.

## Suite di test parametrica

- Smoke: `workflow_dispatch` input `suite=smoke` (esegue `hh:test:smoke:junit` e `truffle:test:smoke:junit`)
- Full: `workflow_dispatch` input `suite=full` (esegue `hh:test:junit` e `truffle:test:junit`)

## Uso locale

- Hardhat JUnit: `npm run hh:test:junit`
- Hardhat smoke JUnit: `npm run hh:test:smoke:junit`
- Truffle JUnit: `npm run truffle:test:junit`
- Truffle smoke JUnit: `npm run truffle:test:smoke:junit`
- Diligence Fuzzing (CI): aggiungi `FUZZ_API_KEY` nei repository Secrets e lancia il workflow dalla pagina Actions.
- Manticore (CI): esegue analisi simbolica sui contratti appiattiti (nessuna configurazione locale richiesta).
 
## Pre-deploy su OP Sepolia

- Variabili richieste:
  - `OP_SEPOLIA_RPC_URL` (es. endpoint Alchemy/Infura per Optimism Sepolia)
  - `OP_SEPOLIA_PRIVATE_KEY` (account deployer; attenzione alla sicurezza)
  - `OP_SEPOLIA_ETHERSCAN_API_KEY` (per verifica su explorer)
- Hardhat rete: `op_sepolia` (chainId `11155420`)
- Comandi:
  - Deploy: `npm run hh:deploy:op-sepolia`
 - Gas report (smoke): `npm run hh:gas`
 - Verify (post-deploy): `npm run hh:verify:op-sepolia <address> [constructorArgs...]`
- Workflow: `Pre-Deploy Gate` (Actions → `pre-deploy.yml`) con input `suite=smoke|full` per test/analisi aggregati.
 - Securify2 (CI): appiattisce i contratti e genera report testuali; non richiede configurazione locale.

## Echidna (property-based)

- Workflow: `echidna.yml`, esegue harness `EchidnaAffiliateProperties.sol` su affiliate/fee tiering e TVL non-negativo.
- Proprietà coperte:
  - `affiliateShareBps <= 10000`
  - `maxFeePercent <= 100`
  - `vault.totalValueLocked() >= 0`


## Gas Check (fail su soglie)

- Workflow: `gas-check.yml` — esegue i test Hardhat con `hardhat-gas-reporter`, salva `reports/gas-report.txt` e fallisce se le soglie definite superano i limiti.
- Soglie: `TRUDE/gas-thresholds.json` mappa `"Contract#Method" -> limiteGas`. Esempio:

```
{
  "TrudeVault#deposit": 120000,
  "TrudeVault#withdraw": 150000
}
```

- Script: `TRUDE/scripts/gas-check.js` legge il report, confronta gli `avg` per ogni voce e termina con exit code `1` in caso di violazioni.
- Esecuzione locale: `npm run gas:check` (crea `reports/gas-report.txt` e valida soglie).
- Note:
  - Solo le chiavi presenti in `gas-thresholds.json` sono enforce; le voci non presenti vengono ignorate.
  - Aggiorna le soglie in base ai dati reali e al profilo desiderato (`SOLC_RUNS`, `SOLC_VIA_IR`).