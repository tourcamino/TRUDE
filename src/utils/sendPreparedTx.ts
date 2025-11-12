import { getInjectedProvider, getChainId, switchChain as eip1193SwitchChain, sendTransaction, Eip1193Provider } from "./wallet/eip1193";

export type PreparedTx = {
  to: string;
  data: string;
  value?: string; // hex string
  chainId?: number;
};

export async function sendPreparedTx(prepared: PreparedTx, provider?: Eip1193Provider): Promise<string> {
  const p = provider ?? getInjectedProvider();
  if (!p) {
    throw new Error("No EIP-1193 provider available (install a wallet)");
  }

  const currentChainId = await getChainId(p);
  if (prepared.chainId && prepared.chainId !== currentChainId) {
    await eip1193SwitchChain(p, prepared.chainId);
  }

  const accounts = await p.request({ method: "eth_accounts" });
  const txParams = {
    from: accounts[0],
    to: prepared.to,
    data: prepared.data,
    value: prepared.value ?? "0x0",
  };

  return sendTransaction(p, txParams);
}
