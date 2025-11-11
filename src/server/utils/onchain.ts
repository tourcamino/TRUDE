import { env } from "~/server/env";
import { Wallet, JsonRpcProvider, Contract, Interface } from "ethers";
import vaultArtifact from "../../../artifacts/contracts/TrudeVault.sol/TrudeVault.json" assert { type: "json" };

export function getProvider(): JsonRpcProvider {
  const url = env.CHAIN_RPC_URL || "http://127.0.0.1:8545";
  return new JsonRpcProvider(url);
}

export function getServiceWallet(): Wallet | null {
  if (!env.SERVICE_SIGNER_PRIVATE_KEY) return null;
  const provider = getProvider();
  return new Wallet(env.SERVICE_SIGNER_PRIVATE_KEY, provider);
}

export async function withdrawCapitalOnChain({
  vaultAddress,
  amount,
  signer,
}: {
  vaultAddress: string;
  amount: bigint;
  signer: Wallet;
}) {
  const vault = new Contract(vaultAddress, (vaultArtifact as any).abi, signer);
  const tx = await (vault as any).withdrawCapital(amount);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export function buildWithdrawCalldata(amount: bigint): string {
  const iface = new Interface((vaultArtifact as any).abi);
  return iface.encodeFunctionData("withdrawCapital", [amount]);
}

export function buildWithdrawProfitCalldata(amount: bigint): string {
  const iface = new Interface((vaultArtifact as any).abi);
  return iface.encodeFunctionData("withdrawProfit", [amount]);
}