import { JsonRpcProvider, Contract, Interface, Log } from "ethers";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const vaultArtifact = require("../../../artifacts/contracts/TrudeVault.sol/TrudeVault.json");

const iface = new Interface((vaultArtifact as any).abi);

export async function fetchVaultEvents(provider: JsonRpcProvider, vaultAddress: string, fromBlock: number, toBlock: number) {
  const vault = new Contract(vaultAddress, (vaultArtifact as any).abi, provider);
  const topics = [
    iface.getEvent("Deposit")?.topicHash,
    iface.getEvent("Withdraw")?.topicHash,
    iface.getEvent("ProfitRegistered")?.topicHash,
    iface.getEvent("TVLUpdated")?.topicHash,
    iface.getEvent("CapitalWithdraw")?.topicHash,
  ].filter(Boolean);
  const logs: Log[] = await provider.getLogs({ address: vaultAddress, fromBlock, toBlock, topics: topics as string[] });
  return logs.map((log) => {
    try {
      const parsed = iface.parseLog(log);
      return {
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        event: parsed?.name,
        args: parsed?.args ? Object.fromEntries(Object.entries(parsed.args)) : {},
      };
    } catch {
      return { blockNumber: log.blockNumber, txHash: log.transactionHash, event: "Unknown", args: {} };
    }
  });
}
