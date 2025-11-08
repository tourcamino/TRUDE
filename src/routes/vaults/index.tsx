import { createFileRoute, Link } from "@tanstack/react-router";
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
  Vault, 
  Plus, 
  Search,
  TrendingUp,
  Clock,
  X
} from "lucide-react";

export const Route = createFileRoute("/vaults/")({
  component: VaultsPage,
});

const createVaultSchema = z.object({
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  tokenSymbol: z.string().min(1, "Token symbol is required").max(10, "Max 10 characters"),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  ledgerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

type CreateVaultForm = z.infer<typeof createVaultSchema>;

function VaultsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const priceQuery = useEthUsdPrice();
  const toUSD = (wei: string) => (priceQuery.data ? formatWeiToUSD(wei, priceQuery.data) : "...");

  const vaultsQuery = useQuery(
    trpc.getVaults.queryOptions({ limit: 20 })
  );

  const createVaultMutation = useMutation(
    trpc.createVault.mutationOptions({
      onSuccess: () => {
        toast.success("Vault created successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getVaults.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.getDashboardStats.queryKey() });
        setShowCreateModal(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create vault");
      },
    })
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateVaultForm>({
    resolver: zodResolver(createVaultSchema),
    defaultValues: { tokenSymbol: "" },
  });

  const onSubmit = (data: CreateVaultForm) => {
    createVaultMutation.mutate(data);
  };

  // Keep local ether formatter only if needed elsewhere; TVL displays use USD

  const filteredVaults = vaultsQuery.data?.vaults.filter((vault) =>
    vault.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vault.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Vaults</h1>
            <p className="mt-2 text-gray-600">Explore and manage TRUDE vaults</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Create Vault</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by symbol or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Vaults Grid */}
        {vaultsQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        ) : filteredVaults && filteredVaults.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVaults.map((vault) => (
              <Link
                key={vault.id}
                to="/vaults/$vaultId"
                params={{ vaultId: vault.id.toString() }}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                      <Vault className="h-6 w-6 text-white" />
                    </div>
                    {vault.isPaused && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                        Paused
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{vault.tokenSymbol} Vault</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    {vault.address.slice(0, 10)}...{vault.address.slice(-8)}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">TVL</span>
                      <span className="font-semibold text-gray-900">${toUSD(vault.totalValueLocked)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Created</span>
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(vault.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-indigo-600">View Details</span>
                    <TrendingUp className="h-5 w-5 text-indigo-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Vault className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No vaults found</h3>
            <p className="text-gray-600">Try adjusting your search or create a new vault</p>
          </div>
        )}
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New Vault</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="tokenAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Token Address
                </label>
                <input
                  id="tokenAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("tokenAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.tokenAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.tokenAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tokenSymbol" className="mb-1 block text-sm font-medium text-gray-700">
                  Token Symbol
                </label>
                <input
                  id="tokenSymbol"
                  type="text"
                  placeholder="USDC"
                  {...register("tokenSymbol")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.tokenSymbol && (
                  <p className="mt-1 text-sm text-red-600">{errors.tokenSymbol.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ownerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Owner Address
                </label>
                <input
                  id="ownerAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("ownerAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.ownerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ledgerAddress" className="mb-1 block text-sm font-medium text-gray-700">
                  Ledger Address
                </label>
                <input
                  id="ledgerAddress"
                  type="text"
                  placeholder="0x..."
                  {...register("ledgerAddress")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.ledgerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.ledgerAddress.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createVaultMutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {createVaultMutation.isPending ? "Creating..." : "Create Vault"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
