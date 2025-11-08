import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, Wallet, Smartphone } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWalletStore } from "~/stores/walletStore";
import { connectMetaMask, setupMetaMaskListeners, isMetaMaskInstalled } from "~/utils/walletConnection";
import { useTRPC } from "~/trpc/react";
import toast from "react-hot-toast";

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, setIsConnecting: setStoreConnecting } = useWalletStore();
  const trpc = useTRPC();
  
  const connectWalletMutation = useMutation(
    trpc.connectWallet.mutationOptions({
      onSuccess: (data) => {
        if (data.isNewUser) {
          toast.success("Welcome! Your wallet has been registered.");
        }
      },
      onError: (error) => {
        console.error("Failed to register wallet:", error);
        toast.error("Failed to register wallet on server");
      },
    })
  );

  const handleMetaMaskConnect = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask is not installed. Please install the MetaMask browser extension.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    setStoreConnecting(true);

    try {
      const result = await connectMetaMask();
      connect(result.address, result.chainId, result.provider);
      setupMetaMaskListeners();
      
      // Register wallet with backend
      await connectWalletMutation.mutateAsync({
        address: result.address,
        chainId: result.chainId,
      });
      
      toast.success(`Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`);
      onClose();
    } catch (error: any) {
      console.error("Failed to connect MetaMask:", error);
      toast.error(error.message || "Failed to connect to MetaMask");
    } finally {
      setIsConnecting(false);
      setStoreConnecting(false);
    }
  };

  const handleWalletConnectConnect = async () => {
    toast.error("WalletConnect integration coming soon!");
    // TODO: Implement WalletConnect integration
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Connect Wallet
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* MetaMask Browser Extension */}
            <button
              onClick={handleMetaMaskConnect}
              disabled={isConnecting}
              className="w-full flex items-center space-x-4 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-indigo-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">MetaMask Browser</div>
                <div className="text-sm text-gray-500">Connect using browser extension</div>
              </div>
              {isConnecting && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              )}
            </button>

            {/* WalletConnect for Mobile */}
            <button
              onClick={handleWalletConnectConnect}
              disabled={isConnecting}
              className="w-full flex items-center space-x-4 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-indigo-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">WalletConnect</div>
                <div className="text-sm text-gray-500">Connect using mobile wallet</div>
              </div>
            </button>
          </div>

          <div className="mt-6 rounded-lg bg-indigo-50 p-4">
            <p className="text-sm text-indigo-900">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
