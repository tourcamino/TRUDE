import { useState, useEffect } from 'react';
import { WalletConnectProvider, createWalletConnectProvider } from '~/utils/wallet/walletConnect';
import type { IEthereumProvider } from '@walletconnect/ethereum-provider';

interface UseWalletConnectReturn {
  provider: WalletConnectProvider | null;
  ethereumProvider: IEthereumProvider | null;
  accounts: string[];
  chainId: number;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (tx: {
    to: string;
    data: string;
    value?: string;
    chainId?: number;
  }) => Promise<string>;
}

export function useWalletConnect(projectId: string): UseWalletConnectReturn {
  const [provider, setProvider] = useState<WalletConnectProvider | null>(null);
  const [ethereumProvider, setEthereumProvider] = useState<IEthereumProvider | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<number>(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize WalletConnect provider
    const initializeProvider = async () => {
      try {
        const wcProvider = await createWalletConnectProvider({
          projectId,
          metadata: {
            name: 'TRUDE',
            url: window.location.origin,
            icons: [`${window.location.origin}/favicon.ico`],
            description: 'TRUDE - Automated Yield Generation Platform',
          },
          chains: [1, 31337], // Mainnet and local
          showQrModal: true,
          qrModalOptions: {
            themeMode: 'dark',
            themeVariables: {
              '--wcm-z-index': '1000',
              '--wcm-accent-color': '#6366f1',
              '--wcm-accent-fill-color': '#ffffff',
            },
          },
        });

        setProvider(wcProvider);
        setEthereumProvider(wcProvider.getProvider());

        // Set up event listeners
        const providerInstance = wcProvider.getProvider();
        if (providerInstance) {
          providerInstance.on('accountsChanged', handleAccountsChanged);
          providerInstance.on('chainChanged', handleChainChanged);
          providerInstance.on('disconnect', handleDisconnect);

          // Check if already connected
          if (providerInstance.accounts && providerInstance.accounts.length > 0) {
            handleAccountsChanged(providerInstance.accounts);
            handleChainChanged(providerInstance.chainId);
          }
        }
      } catch (err) {
        console.error('Failed to initialize WalletConnect:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize WalletConnect');
      }
    };

    if (projectId) {
      initializeProvider();
    }

    return () => {
      // Cleanup
      if (provider?.getProvider()) {
        provider.getProvider()?.off('accountsChanged', handleAccountsChanged);
        provider.getProvider()?.off('chainChanged', handleChainChanged);
        provider.getProvider()?.off('disconnect', handleDisconnect);
      }
    };
  }, [projectId]);

  const handleAccountsChanged = (newAccounts: string[]) => {
    setAccounts(newAccounts || []);
    setIsConnected((newAccounts || []).length > 0);
  };

  const handleChainChanged = (newChainId: number) => {
    setChainId(newChainId);
  };

  const handleDisconnect = () => {
    setAccounts([]);
    setIsConnected(false);
    setError('Wallet disconnected');
  };

  const connect = async () => {
    if (!provider) {
      setError('WalletConnect provider not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const connectedAccounts = await provider.connect();
      handleAccountsChanged(connectedAccounts);
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (provider) {
      try {
        await provider.disconnect();
        handleDisconnect();
      } catch (err) {
        console.error('Disconnect failed:', err);
        setError(err instanceof Error ? err.message : 'Disconnect failed');
      }
    }
  };

  const sendTransaction = async (tx: {
    to: string;
    data: string;
    value?: string;
    chainId?: number;
  }): Promise<string> => {
    if (!ethereumProvider) {
      throw new Error('WalletConnect provider not connected');
    }

    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const txHash = await ethereumProvider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: tx.to,
          data: tx.data,
          value: tx.value || '0x0',
          chainId: tx.chainId ? `0x${tx.chainId.toString(16)}` : undefined,
        }],
      });

      return txHash as string;
    } catch (err) {
      console.error('Transaction failed:', err);
      throw new Error(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  return {
    provider,
    ethereumProvider,
    accounts,
    chainId,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendTransaction,
  };
}