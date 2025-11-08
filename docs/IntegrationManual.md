# Integration Manual: App ↔ Smart Contracts

## Objective
Align TRUDE platform features with on-chain contracts for vault creation, deposits, profit registration, withdrawals, pause/unpause, and affiliate tracking.

## Prerequisites
- EVM provider and signer (MetaMask or RPC), local `hardhat node` or a testnet.
- Contract ABIs available after `hh:compile` under `artifacts/` or `cache/`.
- Deployed contract addresses (Factory, Vaults, Affiliate).

## UI → On-chain Function Mapping
- Vault creation (Admin UI): call `Factory.createVault(tokenAddress)`; capture the `VaultCreated` event and persist the new vault address and token in the DB.
- Deposit (User UI):
  - `ERC20.approve(vaultAddress, amount)` on the vault’s token.
  - `Vault.deposit(amount)`.
  - Subscribe to `Deposit` and `TVLUpdated` to reflect changes in UI/DB.
- Profit registration (Admin/Strategy Engine):
  - Introduce a Factory function that forwards `Vault.registerProfit(user, amount)` to respect `onlyFactory` in the Vault.
  - Subscribe to `ProfitRegistered`/`TVLUpdated` and update DB accordingly.
- Profit withdrawal (User UI): `Vault.withdrawProfit()`; listen for `Withdraw` and update DB.
- Pause/Unpause:
  - Factory: `factory.pause()`/`factory.unpause()` (ledger only).
  - Vault: `vault.pause()`/`vault.unpause()` (owner or ledger).

## Event Synchronization → DB
- Subscribe to Factory/Vault/Affiliate events via a WebSocket provider or polling:
  - `VaultCreated`: add a `Vault` record with address and token.
  - `Deposit`, `ProfitRegistered`, `Withdraw`, `TVLUpdated`: update `Deposit`, `Profit`, balances and TVL.
  - `AffiliatePaid`: update affiliate earnings.

## Error Handling and Edge Cases
- `Pausable`: enforce UI restrictions when Factory/Vault are paused.
- `BelowMin`: block deposits below `minDeposit`; display help text using token `decimals()`.
- Access control: respect `onlyFactory`, `onlyOwner`, `onlyLedger`; gate admin actions in UI and backend.
- Transaction failures: surface revert reasons to users; retry or guide to resolve (approve, network, limits).

## Token Decimals
- Always read `decimals()` from the vault’s token and convert user-facing amounts to smallest units before calling `deposit`/`withdrawProfit`.

## Example Integration (ethers v6)
```ts
import { ethers } from "ethers";

const factory = new ethers.Contract(factoryAddress, FactoryAbi, signer);
const token = new ethers.Contract(tokenAddress, ERC20Abi, signer);
const vault = new ethers.Contract(vaultAddress, VaultAbi, signer);

// Approve + deposit
await token.approve(vaultAddress, amount);
await vault.deposit(amount);

// Pause vault (ledger or owner)
await vault.connect(ledgerSigner).pause();
```

## Next Steps
- Implement an on-chain service layer in the backend (provider/signer) and a lightweight indexer to mirror events into Prisma models.

## Obiettivo
Allineare le funzionalità della piattaforma TRUDE con i contratti on-chain per depositi, profitti, pause e tracciamento affiliati.

## Prerequisiti
- Provider EVM (MetaMask o RPC), rete di test locale (`hardhat node`) o testnet.
- ABIs da `artifacts/` o `cache/` dopo `hh:compile`.
- Indirizzi dei contratti deployati (Factory, Vaults, Affiliate).

## Mappatura Funzioni UI → Contratti
- Creazione Vault (Admin UI): chiamata `Factory.createVault(tokenAddress)`; salvare l’indirizzo del vault ritornato ed emesso in `VaultCreated` nel DB.
- Deposito (UI utente):
  - `ERC20.approve(vaultAddress, amount)` sul token del vault.
  - `Vault.deposit(amount)`.
  - Ascoltare `Deposit` e `TVLUpdated` per aggiornare UI/DB.
- Registrazione Profitto (Admin/Strategy Engine):
  - Chiamare funzione in Factory che inoltri `Vault.registerProfit(user, amount)` (da aggiungere nella Factory).
  - Ascoltare `ProfitRegistered`/`TVLUpdated` e aggiornare DB.
- Prelievo Profitto (UI utente): `Vault.withdrawProfit()`; ascoltare `Withdraw` e aggiornare DB.
- Pause/Unpause:
  - Factory: `factory.pause()`/`factory.unpause()` (solo ledger).
  - Vault: `vault.pause()`/`vault.unpause()` (owner o ledger).

## Sincronizzazione Eventi → DB
- Sottoscrivere eventi Factory/Vault/Affiliate via provider WebSocket o polling:
  - `VaultCreated`: creare record in `Vault` DB con indirizzo/token.
  - `Deposit`, `ProfitRegistered`, `Withdraw`, `TVLUpdated`: aggiornare `Deposit`, `Profit`, TVL e saldi.
  - `AffiliatePaid`: aggiornare guadagni affiliati.

## Error Handling ed Edge Cases
- `Pausable`: bloccare operazioni in UI quando `paused` su factory/vault.
- `BelowMin`: impedire deposito sotto `minDeposit` (mostrare messaggio con unità del token).
- `onlyFactory`/`onlyOwner`/`onlyLedger`: applicare controlli lato server e UI, evitare chiamate non autorizzate.
- Decimali token: usare `decimals()` per calcolare unità corrette in input/output.

## Esempio di Integrazione (pseudo-code, ethers v6)
```ts
const factory = new ethers.Contract(factoryAddress, FactoryAbi, signer);
const token = new ethers.Contract(tokenAddress, ERC20Abi, signer);
const vault = new ethers.Contract(vaultAddress, VaultAbi, signer);

// Approve + deposit
await token.approve(vaultAddress, amount);
await vault.deposit(amount);

// Pause vault (ledger or owner)
await vault.connect(ledgerSigner).pause();
```

## Passo Successivo
- Implementare nel backend una service layer on-chain (provider/signer) e un indexer leggero per riflettere gli eventi nei modelli Prisma.