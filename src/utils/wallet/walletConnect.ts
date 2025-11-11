export type WalletConnectOptions = {
  projectId: string;
  chains?: number[];
  optionalChains?: number[];
  metadata?: {
    name: string;
    description?: string;
    url: string;
    icons?: string[];
  };
};

export async function createWalletConnectProvider(options: WalletConnectOptions) {
  let EthereumProvider: any;
  try {
    const mod = await import("@walletconnect/ethereum-provider");
    EthereumProvider = (mod as any).default ?? (mod as any).EthereumProvider;
  } catch (err) {
    throw new Error(
      "@walletconnect/ethereum-provider is not installed. Please add it to your project dependencies to use WalletConnect."
    );
  }

  if (!EthereumProvider) {
    throw new Error("WalletConnect EthereumProvider module not found.");
  }

  const provider = await EthereumProvider.init({
    projectId: options.projectId,
    chains: options.chains,
    optionalChains: options.optionalChains,
    metadata: options.metadata,
    showQrModal: true,
  });

  return provider as unknown as {
    request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
    on?: (event: string, listener: (...args: any[]) => void) => void;
    removeListener?: (event: string, listener: (...args: any[]) => void) => void;
  };
}