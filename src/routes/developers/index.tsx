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

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">REST API</h3>
              <p className="mb-4 text-gray-600">
                Simple HTTP endpoints for depositing, withdrawing, and querying vault data. 
                Perfect for web and mobile applications handling stablecoin yields.
              </p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <CheckCircle className="h-4 w-4" />
                <span>Easy to integrate</span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
                <Network className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">GraphQL API</h3>
              <p className="mb-4 text-gray-600">
                Flexible queries for complex data requirements. Fetch exactly what you need 
                with powerful filtering and pagination.
              </p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <CheckCircle className="h-4 w-4" />
                <span>Flexible queries</span>
              </div>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Smart Contracts</h3>
              <p className="mb-4 text-gray-600">
                Direct on-chain integration for maximum decentralization. 
                Interact with vaults directly from your smart contracts.
              </p>
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <CheckCircle className="h-4 w-4" />
                <span>Fully decentralized</span>
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

          <div className="grid gap-8 lg:grid-cols-2">
            {/* REST API Example */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Deposit via REST API</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/createDeposit

{
  "userAddress": "0x123...",
  "vaultId": 1,
  "amount": "10000000",
  "affiliateAddress": "0xAFF..."
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Create a deposit by sending a POST request with the user's address, vault ID, 
                and amount in the token's smallest unit (e.g., 10 USDC = 10000000 with 6 decimals). 
                Optional affiliate address for referral tracking.
              </p>
            </div>

            {/* Withdraw Example */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Withdraw Profits</h3>
              </div>
              <div className="rounded-xl bg-gray-900 p-4">
                <pre className="overflow-x-auto text-sm text-gray-100">
                  <code>{`POST /api/trpc/withdrawProfit

{
  "userAddress": "0x123...",
  "profitId": 42
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Withdraw profits by providing the user's address and the profit ID. 
                The system will mark the profit as withdrawn and update balances accordingly.
              </p>
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
  "deposits": [...],
  "profits": [...]
}`}</code>
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Get comprehensive dashboard data for a user including deposits, profits, and performance metrics. 
                All amounts are denominated in stablecoin smallest units.
              </p>
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
              <h3 className="mb-2 text-lg font-bold text-gray-900">Non-Custodial</h3>
              <p className="text-sm text-gray-600">
                Your users maintain full control of their funds. TRUDE never takes custody, 
                ensuring maximum security and trust.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <Shield className="mb-3 h-8 w-8 text-green-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Smart Contract Compliance</h3>
              <p className="text-sm text-gray-600">
                All operations are governed by audited smart contracts with transparent on-chain execution.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <Zap className="mb-3 h-8 w-8 text-purple-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">AI-Driven Optimization</h3>
              <p className="text-sm text-gray-600">
                Advanced algorithms continuously optimize yield strategies to maximize returns for your users.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <Network className="mb-3 h-8 w-8 text-blue-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Multi-Protocol Support</h3>
              <p className="text-sm text-gray-600">
                Integrate with multiple DeFi protocols through a single, unified API interface.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <BookOpen className="mb-3 h-8 w-8 text-orange-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Comprehensive Docs</h3>
              <p className="text-sm text-gray-600">
                Detailed documentation, code examples, and SDKs to accelerate your integration.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <CheckCircle className="mb-3 h-8 w-8 text-pink-600" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">Production Ready</h3>
              <p className="text-sm text-gray-600">
                Battle-tested infrastructure serving thousands of users with 99.9% uptime.
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
