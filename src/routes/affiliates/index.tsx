import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { useTRPC } from "~/trpc/react";
import { useEthUsdPrice, formatWeiToUSD } from "~/utils/currency";
import { 
  Users, 
  DollarSign, 
  UserPlus,
  Copy,
  TrendingUp,
  Award,
  Share2
} from "lucide-react";

export const Route = createFileRoute("/affiliates/")({
  component: AffiliatesPage,
});

const registerAffiliateSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  referrerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

type RegisterAffiliateForm = z.infer<typeof registerAffiliateSchema>;

function AffiliatesPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [lookupAddress, setLookupAddress] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0");
  const priceQuery = useEthUsdPrice();
  const toUSD = (wei: string) => (priceQuery.data ? formatWeiToUSD(wei, priceQuery.data) : "...");

  const affiliateStatsQuery = useQuery(
    trpc.getAffiliateStats.queryOptions({ userAddress: lookupAddress })
  );

  const registerAffiliateMutation = useMutation(
    trpc.registerAffiliate.mutationOptions({
      onSuccess: () => {
        toast.success("Affiliate registered successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getAffiliateStats.queryKey() });
        reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register affiliate");
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterAffiliateForm>({
    resolver: zodResolver(registerAffiliateSchema),
  });

  const onSubmit = (data: RegisterAffiliateForm) => {
    registerAffiliateMutation.mutate(data);
  };

  const formatEther = (wei: string) => {
    const ether = Number(BigInt(wei) / BigInt(1e18));
    return ether.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${lookupAddress}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const stats = affiliateStatsQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Affiliate Program</h1>
          <p className="mt-2 text-gray-600">Earn rewards by referring users to TRUDE Vault</p>
        </div>

        {/* Lookup Section */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <label htmlFor="lookupAddress" className="mb-2 block text-sm font-medium text-gray-700">
            Check Affiliate Stats for Address
          </label>
          <div className="flex gap-2">
            <input
              id="lookupAddress"
              type="text"
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        {affiliateStatsQuery.isLoading ? (
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        ) : (
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">${toUSD(stats?.totalEarnings || "0")}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.referralCount || 0}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-600/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-3 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <p className="mb-1 text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-3xl font-bold text-gray-900">50%</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Referral Link */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Your Referral Link</h3>
                <p className="text-indigo-100">Share this link to earn rewards</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <input
                type="text"
                value={`${window.location.origin}?ref=${lookupAddress.slice(0, 10)}...`}
                readOnly
                className="flex-1 bg-transparent text-white focus:outline-none"
              />
              <button
                onClick={copyReferralLink}
                className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>

            <div className="mt-6 space-y-2 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-200">Earn per referral:</span>
                <span className="font-semibold text-white">Up to 50% of fees</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-200">Lifetime tracking:</span>
                <span className="font-semibold text-white">Yes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-200">Minimum payout:</span>
                <span className="font-semibold text-white">None</span>
              </div>
            </div>
          </div>

          {/* Register Affiliate Form */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Register New Affiliate</h3>
                <p className="text-sm text-gray-600">Connect a user with their referrer</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="userAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  User Address
                </label>
                <input
                  id="userAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("userAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.userAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.userAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="referrerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Referrer Address
                </label>
                <input
                  id="referrerAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("referrerAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.referrerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.referrerAddress.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerAffiliateMutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {registerAffiliateMutation.isPending ? "Registering..." : "Register Affiliate"}
              </button>
            </form>
          </div>
        </div>

        {/* Referrals List */}
        {stats && stats.referrals.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Your Referrals</h3>
            <div className="space-y-3">
              {stats.referrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {referral.address.slice(0, 10)}...{referral.address.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(referral.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${toUSD(referral.earnings)}</p>
                    <p className="text-sm text-gray-500">Earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
