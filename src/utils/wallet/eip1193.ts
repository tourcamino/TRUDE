// Minimal EIP-1193 provider adapter and helpers
// Works with MetaMask, Rabby, Coinbase Extension, Brave, etc.

export type Eip1193RequestArgs = {
  method: string;
  params?: any[] | Record<string, any>;
};

export interface Eip1193Provider {
  request: (args: Eip1193RequestArgs) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
}

export const hasInjectedProvider = (): boolean => {
  return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
};

export const getInjectedProvider = (): Eip1193Provider | null => {
  if (!hasInjectedProvider()) return null;
  return (window as any).ethereum as Eip1193Provider;
};

export const getChainId = async (provider: Eip1193Provider): Promise<number> => {
  const hex = await provider.request({ method: "eth_chainId" });
  return parseInt(hex, 16);
};

export const getAccounts = async (provider: Eip1193Provider): Promise<string[]> => {
  return provider.request({ method: "eth_accounts" });
};

export const switchChain = async (provider: Eip1193Provider, chainId: number): Promise<void> => {
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${chainId.toString(16)}` }],
  });
};

export type TransactionParams = {
  from?: string;
  to: string;
  data?: string;
  value?: string; // hex value
};

export const sendTransaction = async (
  provider: Eip1193Provider,
  tx: TransactionParams,
): Promise<string> => {
  const txHash: string = await provider.request({
    method: "eth_sendTransaction",
    params: [tx],
  });
  return txHash;
};