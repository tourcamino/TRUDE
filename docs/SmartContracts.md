# TRUDE Smart Contracts – Technical Specification

## Overview
- `TrudeFactory` (`^0.8.25`): creates vaults, manages global parameters (`minDeposit`, `affiliateShareBps`, `maxFeePercent`), pause/unpause at factory level (ledger only), tracks authorized vaults and affiliate mappings.
- `TrudeVault` (`^0.8.25`): ERC20 deposits with `SafeERC20`, profit registration (factory only), profit withdrawals with dynamic fees and affiliate payouts, pause/unpause (owner or ledger).
- `TrudeAffiliate` (`^0.8.25`): tracks affiliate lifetime earnings; `onlyOwner` updates (should be Factory if Vault→Factory→Affiliate flow is desired).
- `USDCMock` (`^0.8.24`): mock ERC20 token with `decimals=6` for testing.

## Versions and Compatibility
- Hardhat configured to compile with `0.8.25` and `0.8.24` (see `hardhat.config.ts`).
- OpenZeppelin Upgradeable imported; UUPS requires proxy for full upgrade semantics (not included in the current deploy script).

## Roles and Permissions
- Factory: `Ownable`, `Pausable`, `UUPS`. Ledger (multisig) may `pause/unpause` the Factory.
- Vault: `Ownable`, `Pausable`, `ReentrancyGuard`. Owner or ledger may `pause/unpause`.
- Profit Registration: `TrudeVault.registerProfit` is `onlyFactory` (must be invoked via a Factory function).
- Affiliate Tracker: `recordAffiliateEarning` is `onlyOwner`; to enable Vault→Factory→Affiliate, the tracker owner should be the Factory.

## Events
- Factory: `VaultCreated`, `AffiliateRegistered`, parameter update events.
- Vault: `Deposit`, `ProfitRegistered`, `Withdraw`, `TVLUpdated`.
- Affiliate: `AffiliatePaid`.

## Operational Flows
1. Vault Creation: `Factory.createVault(token)` → `Vault.initialize(factory, token, owner, ledger)` → `isVault[vault]=true`.
2. Deposit: User approves the vault (`ERC20.approve`), then calls `vault.deposit(amount)` (>= `minDeposit`).
3. Profit Registration: Should be executed by the Factory (not provided in Factory contract yet; to be added).
4. Profit Withdrawal: User calls `vault.withdrawProfit()`; dynamic fee is computed, affiliate payout distributed, TVL updated.
5. Affiliate Tracking: Factory optionally calls `affiliate.recordAffiliateEarning` (requires Factory to be tracker owner).

## Compliance Gaps Identified
- Missing Factory function to forward `registerProfit` (required to satisfy `onlyFactory`).
- Deploy script does not include Factory/Vault/Affiliate nor UUPS proxy/initialization options.
- The app currently operates off-chain (Prisma) for deposits/profits: on-chain integration with `ethers` and event synchronization is required.

## Recommendations
- Add `registerProfitFor(address vault, address user, uint256 profit)` to `TrudeFactory` that invokes `TrudeVault(vault).registerProfit(user, profit)`.
- Integrate the app with provider/signer and contract ABIs, replacing DB-only operations with on-chain transactions and event mirroring in the DB.
- If UUPS is desired, introduce upgrade plugins and deploy via proxy with `initialize` invoked on the proxy.