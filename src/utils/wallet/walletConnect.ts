import { EthereumProvider } from '@walletconnect/ethereum-provider';
import type { IEthereumProvider } from '@walletconnect/ethereum-provider';

export interface WalletConnectConfig {
  projectId: string;
  metadata: {
    name: string;
    url: string;
    icons: string[];
    description?: string;
  };
  chains?: number[];
  showQrModal?: boolean;
  qrModalOptions?: {
    themeMode?: 'light' | 'dark';
    themeVariables?: Record<string, string>;
  };
}

export class WalletConnectProvider {
  private provider: IEthereumProvider | null = null;
  private config: WalletConnectConfig;

  constructor(config: WalletConnectConfig) {
    this.config = {
      chains: [1, 31337], // Ethereum mainnet + local
      showQrModal: true,
      ...config
    };
  }

  async initialize(): Promise<IEthereumProvider> {
    try {
      this.provider = await EthereumProvider.init({
        projectId: this.config.projectId,
        metadata: this.config.metadata,
        chains: this.config.chains,
        showQrModal: this.config.showQrModal,
        qrModalOptions: this.config.qrModalOptions,
        methods: ['eth_sendTransaction', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
        events: ['chainChanged', 'accountsChanged'],
      });

      // Auto-connect if session exists
      if (this.provider.session) {
        await this.connect();
      }

      return this.provider;
    } catch (error) {
      console.error('WalletConnect initialization failed:', error);
      throw new Error(`WalletConnect init failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async connect(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await this.provider.connect();
      return this.provider.accounts;
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      throw new Error(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }

  getProvider(): IEthereumProvider | null {
    return this.provider;
  }

  getAccounts(): string[] {
    return this.provider?.accounts || [];
  }

  getChainId(): number {
    return this.provider?.chainId || 1;
  }

  on(event: string, handler: (data: any) => void): void {
    if (this.provider) {
      this.provider.on(event, handler);
    }
  }

  off(event: string, handler: (data: any) => void): void {
    if (this.provider) {
      this.provider.off(event, handler);
    }
  }
}

// Factory function for easy initialization
export async function createWalletConnectProvider(config: WalletConnectConfig): Promise<WalletConnectProvider> {
  const provider = new WalletConnectProvider(config);
  await provider.initialize();
  return provider;
}

// Utility function to send transactions via WalletConnect
export async function sendTransactionViaWalletConnect(
  provider: IEthereumProvider,
  transaction: {
    to: string;
    data: string;
    value?: string;
    chainId?: number;
  }
): Promise<string> {
  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0x0',
        chainId: transaction.chainId ? `0x${transaction.chainId.toString(16)}` : undefined,
      }],
    });

    return txHash as string;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}