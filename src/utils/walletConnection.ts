import { useWalletStore } from "~/stores/walletStore";
import toast from "react-hot-toast";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface ConnectionResult {
  address: string;
  chainId: number;
  provider: any;
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
};

export const connectMetaMask = async (): Promise<ConnectionResult> => {
  // Note: The backend registration should be handled in the component that calls connectMetaMask
  // by using the tRPC mutation after successful connection. This keeps the utility function
  // independent of tRPC and allows for better separation of concerns.
  
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask extension.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    // Get chain ID
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    return {
      address: accounts[0],
      chainId: parseInt(chainId, 16),
      provider: window.ethereum,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw error;
  }
};

export const setupMetaMaskListeners = () => {
  if (!isMetaMaskInstalled()) return;

  const store = useWalletStore.getState();

  // Handle account changes
  window.ethereum.on("accountsChanged", (accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      // User disconnected
      store.disconnect();
      toast.error("Wallet disconnected");
    } else {
      // User switched accounts
      const addr = accounts[0]!;
      store.setAddress(addr);
      toast.success(`Switched to ${addr.slice(0, 6)}...${addr.slice(-4)}`);
    }
  });

  // Handle chain changes
  window.ethereum.on("chainChanged", (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    store.setChainId(newChainId);
    toast.success(`Switched to chain ${newChainId}`);
    // Reload the page as recommended by MetaMask
    window.location.reload();
  });
};

export const removeMetaMaskListeners = () => {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.removeAllListeners("accountsChanged");
  window.ethereum.removeAllListeners("chainChanged");
};

export const disconnectWallet = () => {
  const store = useWalletStore.getState();
  removeMetaMaskListeners();
  store.disconnect();
  toast.success("Wallet disconnected");
};

export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const switchChain = async (chainId: number): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error("Please add this network to MetaMask first");
    }
    throw error;
  }
};

export const reconnectWallet = async (): Promise<void> => {
  const store = useWalletStore.getState();
  
  // Only try to reconnect if we have a stored address
  if (!store.address || !isMetaMaskInstalled()) {
    return;
  }

  try {
    // Check if still connected
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === store.address.toLowerCase()) {
      // Still connected, update provider
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      
      store.setProvider(window.ethereum);
      store.setChainId(parseInt(chainId, 16));
      setupMetaMaskListeners();
    } else {
      // Not connected anymore, clear state
      store.disconnect();
    }
  } catch (error) {
    console.error("Failed to reconnect wallet:", error);
    store.disconnect();
  }
};
