# Production Deployment Plan

## Step 1: Build & Test
- `npm run hh:compile` compiles with Solidity `0.8.25/0.8.24`.
- `npm run hh:test` runs unit tests (Factory/Vault/USDCMock).
- Consider UUPS proxy (OpenZeppelin Upgrades) if upgradeability is required.

## Step 2: Network Configuration
- Define RPC, `chainId`, and deployer accounts (ledger multisig, owner) for the target network.
- Prepare `.env` with keys and administrative addresses.

## Step 3: Contract Deployment
- Factory: deploy and `initialize(owner, ledger, minDeposit)`.
- (Optional) Affiliate: deploy and `initialize(owner=factory)` to enable `recordAffiliateEarning` via Factory.
- Record addresses and ABIs.

## Step 4: App Wiring
- Update backend with contract addresses and ABIs.
- Implement `createVault`, `deposit`, `withdrawProfit`, `pause/unpause` via `ethers`.
- Introduce event synchronization → DB for TVL and balances.

## Step 5: Security
- Set roles (owner/ledger) correctly and confirm `onlyOwner/onlyLedger` are enforced.
- Restrict admin functions in the UI with roles and tokens; validate consistency with contracts.

## Step 6: Observability
- Log transactions and events.
- Alerts for `paused` state and on-chain errors.

## Step 7: Go-Live
- Perform smoke tests on the production network.
- Freeze critical configurations and plan rollback.