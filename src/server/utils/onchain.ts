import { env } from "../env";
import { Wallet, JsonRpcProvider, Contract, Interface } from "ethers";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const vaultArtifact = require("../../../artifacts/contracts/TrudeVault.sol/TrudeVault.json");
const factoryArtifact = require("../../../artifacts/contracts/TrudeFactory.sol/TrudeFactory.json");
const erc20Iface = new Interface(["function approve(address,uint256)", "function decimals() view returns (uint8)"]);

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

export function buildDepositCalldata(amount: bigint): string {
  const iface = new Interface((vaultArtifact as any).abi);
  return iface.encodeFunctionData("deposit", [amount]);
}

export function buildApproveCalldata(spender: string, amount: bigint): string {
  return erc20Iface.encodeFunctionData("approve", [spender, amount]);
}

export function buildCreateVaultCalldata(tokenAddress: string): string {
  const iface = new Interface((factoryArtifact as any).abi);
  return iface.encodeFunctionData("createVault", [tokenAddress]);
}

export function buildSetMinDepositCalldata(value: bigint): string {
  const iface = new Interface((factoryArtifact as any).abi);
  return iface.encodeFunctionData("setMinDeposit", [value]);
}

export function buildSetAffiliateShareBpsCalldata(bps: number): string {
  const iface = new Interface((factoryArtifact as any).abi);
  return iface.encodeFunctionData("setAffiliateShareBps", [bps]);
}

export function buildSetMaxFeePercentCalldata(percent: number): string {
  const iface = new Interface((factoryArtifact as any).abi);
  return iface.encodeFunctionData("setMaxFeePercent", [percent]);
}

export function buildRegisterAffiliateCalldata(user: string, affiliate: string): string {
  const iface = new Interface((factoryArtifact as any).abi);
  return iface.encodeFunctionData("registerAffiliate", [user, affiliate]);
}
