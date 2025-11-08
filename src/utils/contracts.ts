import { ethers } from "ethers";
import deployments from "../generated/deployments.local.json";
import TrudeFactoryArtifact from "../../artifacts/contracts/TrudeFactory.sol/TrudeFactory.json";
import TrudeVaultArtifact from "../../artifacts/contracts/TrudeVault.sol/TrudeVault.json";

type Deployments = {
  network: string;
  deployer: string;
  ledger: string;
  contracts: {
    USDCMock: string;
    TrudeFactory: string;
    TrudeAffiliate: string;
    TrudeVault: string;
  };
};

export function getProvider(): ethers.BrowserProvider | ethers.JsonRpcProvider {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return new ethers.JsonRpcProvider("http://localhost:8545");
}

export function getFactory(runner?: ethers.Signer | ethers.Provider) {
  const abi = (TrudeFactoryArtifact as any).abi;
  const address = (deployments as Deployments).contracts.TrudeFactory;
  const providerOrSigner = runner ?? getProvider();
  return new ethers.Contract(address, abi, providerOrSigner);
}

export function getVault(runner?: ethers.Signer | ethers.Provider) {
  const abi = (TrudeVaultArtifact as any).abi;
  const address = (deployments as Deployments).contracts.TrudeVault;
  const providerOrSigner = runner ?? getProvider();
  return new ethers.Contract(address, abi, providerOrSigner);
}

export const addresses = (deployments as Deployments).contracts;