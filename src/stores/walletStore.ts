import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: any | null;
  
  // Actions
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setProvider: (provider: any | null) => void;
  connect: (address: string, chainId: number, provider: any) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      
      setAddress: (address) => set({ address, isConnected: !!address }),
      setChainId: (chainId) => set({ chainId }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setProvider: (provider) => set({ provider }),
      
      connect: (address, chainId, provider) => set({
        address,
        chainId,
        provider,
        isConnected: true,
        isConnecting: false,
      }),
      
      disconnect: () => set({
        address: null,
        chainId: null,
        provider: null,
        isConnected: false,
        isConnecting: false,
      }),
    }),
    {
      name: "wallet-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist address and chainId, not provider or connection states
      partialize: (state) => ({
        address: state.address,
        chainId: state.chainId,
        isConnected: state.isConnected,
      }),
    },
  ),
);
