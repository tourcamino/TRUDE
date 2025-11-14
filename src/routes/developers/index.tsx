import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { 
  Code, 
  Layers, 
  GitBranch, 
  Lock, 
  Zap,
  Shield,
  ArrowRight,
  BookOpen,
  Terminal,
  Boxes,
  Wallet,
  Network,
  Database,
  CheckCircle
} from "lucide-react";

export const Route = createFileRoute("/developers/")({
  component: DevelopersPage,
});

function DevelopersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Code className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium text-white">Developer Documentation</span>
            </div>
            <h1 className="mb-4 text-5xl font-bold text-white sm:text-6xl">
              Build on TRUDE
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-50">
              Integrate our Yield API Layer into your dApp, wallet, or protocol. 
              Offer your users automated yield generation on stablecoins with zero custody risk 
              in the Ethereum environment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/vaults"
                className="flex items-center space-x-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <span>Explore Vaults</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#quick-start"
                className="flex items-center space-x-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Terminal className="h-5 w-5" />
                <span>Quick Start</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Integration Options */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Integration Options</h2>
            <p className="mt-2 text-gray-600">Choose the integration method that works best for your stack</p>
          </div>

          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 hover:scale-105 duration-300">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg group-hover:shadow-xl transition-shadow">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">tRPC HTTP API</h3>
              <p className="mb-4 text-gray-600">
                Endpoints HTTP per preparare transazioni on‑chain e finalizzare gli stati lato server. 
                Ideale per web e mobile con flussi non‑custodial.
              </p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <CheckCircle className="h-4 w-4" />
                <span>Facile da integrare</span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 hover:scale-105 duration-300">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg group-hover:shadow-xl transition-shadow">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Smart Contracts</h3>
              <p className="mb-4 text-gray-600">
                Direct on-chain integration for maximum decentralization. 
                Interact with vaults directly from your smart contracts.
              </p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <CheckCircle className="h-4 w-4" />
                <span>Fully decentralized</span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 hover:scale-105 duration-300">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg group-hover:shadow-xl transition-shadow">
                <Network className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">SDK & Libraries</h3>
              <p className="mb-4 text-gray-600">
                TypeScript SDK with type-safe methods, React hooks, and Vue composables for rapid development.
              </p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <CheckCircle className="h-4 w-4" />
                <span>Type-safe development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Integration Use Cases</h2>
            <p className="mt-2 text-gray-600">TRUDE powers yield for various DeFi applications</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border-2 border-indigo-100 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-lg">
              <Wallet className="mb-3 h-8 w-8 text-indigo-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Wallets</h3>
              <p className="text-sm text-gray-600">
                Offer built-in yield generation to your wallet users. Earn passive income on idle balances.
              </p>
            </div>

            <div className="rounded-xl border-2 border-purple-100 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <Boxes className="mb-3 h-8 w-8 text-purple-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">dApps</h3>
              <p className="text-sm text-gray-600">
                Integrate yield generation into your decentralized application. Enhance user value proposition.
              </p>
            </div>

            <div className="rounded-xl border-2 border-green-100 bg-white p-6 transition-all hover:border-green-300 hover:shadow-lg">
              <Database className="mb-3 h-8 w-8 text-green-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">DeFi Protocols</h3>
              <p className="text-sm text-gray-600">
                Optimize treasury management and protocol-owned liquidity with automated yield strategies.
              </p>
            </div>

            <div className="rounded-xl border-2 border-blue-100 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg">
              <Network className="mb-3 h-8 w-8 text-blue-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">DEX Aggregators</h3>
              <p className="text-sm text-gray-600">
                Route idle liquidity through TRUDE vaults to maximize returns for your users.
              </p>
            </div>

            <div className="rounded-xl border-2 border-orange-100 bg-white p-6 transition-all hover:border-orange-300 hover:shadow-lg">
              <Zap className="mb-3 h-8 w-8 text-orange-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Adapters</h3>
              <p className="text-sm text-gray-600">
                Build custom adapters to connect TRUDE with other DeFi protocols and platforms.
              </p>
            </div>

            <div className="rounded-xl border-2 border-pink-100 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-lg">
              <Shield className="mb-3 h-8 w-8 text-pink-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Custodians</h3>
              <p className="text-sm text-gray-600">
                Offer institutional-grade yield products while maintaining non-custodial security.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div id="quick-start" className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Quick Start Guide</h2>
            <p className="mt-2 text-gray-600">Get started with TRUDE integration in minutes</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* REST API Example */}
            <div className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
              <h3 className="text-xl font-bold text-gray-900">Deposit via Prepared Tx</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/prepareDeposit

{
  "userAddress": "0x123...",
  "vaultId": 1,
  "amount": "10000000"
}

// Response (excerpt)
{
  "success": true,
  "prepared": {
    "approveTx": { "to": "0xToken...", "data": "0x...", "value": "0x0", "chainId": 31337 },
    "depositTx": { "to": "0xVault...", "data": "0x...", "value": "0x0", "chainId": 31337 }
  }
}

// Client-side broadcast (approve then deposit)
ethereum.request({ method: 'eth_sendTransaction', params: [approveTx] })
ethereum.request({ method: 'eth_sendTransaction', params: [depositTx] })

// Finalize on server (update TVL)
POST /api/trpc/finalizeDeposit
{
  "userAddress": "0x123...",
  "vaultId": 1,
  "amount": "10000000",
  "txHash": "0x..."
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Prepare and execute deposits fully on-chain using the user's wallet. Amounts are provided in the token's smallest unit (e.g., 10 USDC = 10000000 with 6 decimals).
                After on-chain confirmation, call <code>finalizeDeposit</code> to update server-side TVL and logs.
              </p>
            </div>

            {/* Withdraw Example */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    <Terminal className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Withdraw Profits (Prepared Tx)</h3>
                </div>
                <div className="rounded-xl bg-gray-900 p-4">
                  <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/withdrawProfit

// Response (excerpt)
{
  "success": true,
  "profit": { "id": 42, "amount": "2500000", "withdrawn": false },
  "preparedTx": {
    "to": "0xVault...",
    "data": "0xabcdef...",
    "value": "0x0",
    "chainId": 31337
  }
}

// Client-side broadcast (e.g., MetaMask)
ethereum.request({ method: 'eth_sendTransaction', params: [{
  to: preparedTx.to,
  data: preparedTx.data,
  value: preparedTx.value
}] })

// Finalize on server
POST /api/trpc/finalizeProfitWithdrawal
{
  "userAddress": "0x123...",
  "profitId": 42,
  "txHash": "0x..."
}`}</code>
                  </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Profit withdrawal returns a <span className="font-semibold">prepared transaction</span> for the user's wallet. Gas costs are paid by the customer; the application does not broadcast transactions.
                After confirmation, call <code>finalizeProfitWithdrawal</code> to update status and TVL.
              </p>
              </div>

              {/* Register Service Delegation */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Terminal className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Register Service Delegation</h3>
                </div>
                <div className="rounded-xl bg-gray-900 p-4">
                  <pre className="overflow-x-auto text-sm text-gray-100">
                    <code>{`POST /api/trpc/registerServiceDelegation

{
  "adminToken": "admin123",
  "userAddress": "0xUSER...",
  "delegatedSigner": "0xDELEGATE...",
  "status": "ACTIVE",
  "policy": {
    "allowlist": ["0xVAULT_ADDRESS..."],
    "maxPerTx": "1000000000", // in smallest unit
    "dailyLimit": "5000000000", // in smallest unit
    "custodial": false
  }
}`}</code>
                  </pre>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Create or update a service delegation for a user to enable auto withdrawal flows with policy checks.
                  Use reasonable limits and include the vault address in the allowlist if you want to restrict withdrawals to specific vaults.
                </p>
              </div>

            {/* Withdraw Capital */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Withdraw Capital</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/withdrawCapital

{
  "userAddress": "0x123...",
  "vaultId": 1,
  "amount": "1000000"
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Withdraw principal (deposit capital) at any time. A fee of 0.1% is applied to the withdrawn capital and sent to the vault owner. The amount is
                specified in the token's smallest unit. Available principal is validated against
                total deposits minus prior capital withdrawals.
              </p>
            </div>

            {/* Request Withdraw Capital (Prepared Tx) */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Request Withdraw Capital (Prepared Tx)</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/requestWithdrawCapital

// mode: "auto" (policy enforced, no auto broadcast)
{
  "mode": "auto",
  "userAddress": "0x123...",
  "vaultId": 1,
  "amount": "1000000",
  "executeNow": true // returns preparedTx for wallet broadcast
}

// mode: "eip712" (off-chain signature verified; client-side on-chain execution)
{
  "mode": "eip712",
  "userAddress": "0x123...",
  "vaultId": 1,
  "amount": "1000000",
  "signature": "0x...",
  "nonce": "0x...",
  "deadline": 1731000000
}

// Response (excerpt)
{
  "success": true,
  "request": { "id": 42, "status": "PENDING", "mode": "auto" },
  "preparedTx": {
    "to": "0xVault...",
    "data": "0xabcdef...",
    "value": "0x0",
    "chainId": 31337
  }
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                This endpoint creates a withdrawal request and returns a <code>preparedTx</code> to be sent with the user's wallet (e.g., MetaMask). 
                Gas costs are always paid by the customer: the app does not broadcast or pay for on-chain transactions.
                In <span className="font-semibold">auto</span> mode, delegation policies are enforced (allowlist, per‑tx and daily limits), but execution occurs only client‑side. 
                In <span className="font-semibold">EIP‑712</span> mode, the signature is verified off‑chain and the request remains `PENDING` until client‑side execution.
              </p>
              <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
                <p>
                  Sending with MetaMask: use <code>{String.raw`ethereum.request({ method: 'eth_sendTransaction', params: [{ to, data, value }] })`}</code> with <code>preparedTx</code> values.
                  Ensure the correct network (`chainId`) and sufficient funds for gas.
                </p>
              </div>
            </div>

            {/* Query Vaults */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Query Available Vaults</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`GET /api/trpc/getVaults

Response:
{
  "vaults": [
    {
      "id": 1,
      "address": "0xVault...",
      "tokenSymbol": "USDC",
      "tokenAddress": "0xA0b8...",
      "tvl": "1000000000"
    }
  ]
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Fetch all available vaults with their details including TVL, stablecoin token information, 
                and contract addresses. All amounts are in the token's smallest unit.
              </p>
            </div>

            {/* User Dashboard */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Get User Dashboard</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`GET /api/trpc/getUserDashboard
  ?userAddress=0x123...

Response:
{
  "totalDeposited": "50000000",
  "totalProfits": "2500000",
  "availablePrincipal": "48000000",
  "totalWithdrawnCapital": "2000000",
  "deposits": [...],
  "profits": [...],
  "withdrawals": [...]
}`}</code>
              </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Get comprehensive dashboard data for a user including deposits, capital withdrawals, profits, and performance metrics. 
                All amounts are denominated in stablecoin smallest units.
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Support */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Wallet Support</h2>
              <p className="mt-2 text-gray-600">MetaMask, Rabby, Coinbase Extension via EIP‑1193; WalletConnect mobile available</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">EIP‑1193 Adapter (Browser Wallets)</h3>
              </div>
              <p className="text-sm text-gray-600">
                The app uses an <span className="font-semibold">EIP‑1193 adapter</span> to interface with any compliant wallet (MetaMask, Rabby, Coinbase Extension, Brave).
                Prepared transactions (<code>preparedTx</code>) are sent via <code>eth_sendTransaction</code> with no wallet‑specific branches.
              </p>
              <div className="mt-3 rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`import { sendPreparedTx } from "~/utils/sendPreparedTx";

// Any EIP-1193 provider (default: window.ethereum)
const txHash = await sendPreparedTx(preparedTx);
`}</code>
                </pre>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">WalletConnect (Mobile)</h3>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">WalletConnect v2</span> support is now available. The architecture uses <span className="font-semibold">prepared transactions</span> and client‑side broadcast.
                Requires <code>@walletconnect/ethereum-provider</code> installed and <code>VITE_WALLETCONNECT_PROJECT_ID</code> configured in your environment.
                The WalletConnect provider exposes an EIP‑1193 interface and uses the same flow.
              </p>
              <div className="mt-3 rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`import { createWalletConnectProvider } from "~/utils/wallet/walletConnect";
import { sendPreparedTx } from "~/utils/sendPreparedTx";

// Initialize WalletConnect provider (requires @walletconnect/ethereum-provider)
const wcProvider = await createWalletConnectProvider({
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: "TRUDE",
    url: window.location.origin,
    icons: ["https://trude.example/icon.png"],
  },
});

// Then send the prepared transaction via WalletConnect
await sendPreparedTx(preparedTx, wcProvider);
`}</code>
                </pre>
              </div>
              <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
                Configuration: install <code>@walletconnect/ethereum-provider</code>, set <code>VITE_WALLETCONNECT_PROJECT_ID</code>, then pass the provider to <code>sendPreparedTx(preparedTx, provider)</code>.
              </div>
            </div>

            
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Integrate TRUDE?</h2>
            <p className="mt-2 text-gray-600">Built for developers, secured by smart contracts</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <Lock className="mb-3 h-8 w-8 text-indigo-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Non‑Custodial</h3>
              <p className="text-sm text-gray-600">
                Gli utenti mantengono il controllo dei fondi. TRUDE non li custodisce.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <Shield className="mb-3 h-8 w-8 text-green-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Contratti Auditabili</h3>
              <p className="text-sm text-gray-600">
                Operazioni governate da smart contract; CI di sicurezza attiva per analisi statiche.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <BookOpen className="mb-3 h-8 w-8 text-orange-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Documentazione</h3>
              <p className="text-sm text-gray-600">
                Esempi chiari di integrazione e flussi prepared/finalize per ridurre errori.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12 text-center shadow-2xl">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Build?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100">
            Start integrating TRUDE's stablecoin yield infrastructure today. Explore our vaults 
            and see the API in action with USDC, USDT, DAI, and other stablecoins on Ethereum.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/vaults"
              className="flex items-center space-x-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <span>Explore Vaults</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <span>Try the Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
            {/* Create Vault via Factory */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-black">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create Vault (Factory)</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/prepareCreateVault

{
  "tokenAddress": "0xToken..."
}

// Broadcast with admin wallet
ethereum.request({ method: 'eth_sendTransaction', params: [preparedTx] })

// Finalize in DB
POST /api/trpc/finalizeCreateVault
{
  "vaultAddress": "0xVault...",
  "tokenAddress": "0xToken...",
  "tokenSymbol": "USDC",
  "ownerAddress": "0xOwner...",
  "ledgerAddress": "0xLedger..."
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Use <code>Factory.createVault</code> to deploy new vaults on-chain and register them in the application database.
              </p>
            </div>

            {/* Update Factory Settings On-Chain */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-700">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Update Factory Settings (On-Chain)</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/prepareUpdateFactorySettingsOnChain

{
  "minDeposit": "10000000",
  "affiliateShareBps": 5000,
  "maxFeePercent": 20
}

// Returns a list of prepared tx to broadcast with admin wallet
// Apply only the required updates
`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Generate on-chain setter transactions for Factory parameters (minimum deposit, affiliate share bps, max fee percent).
              </p>
            </div>
