import { TypedDataDomain, TypedDataField, verifyTypedData, TypedDataEncoder } from "ethers";

export type WithdrawTypedData = {
  user: string;
  vault: string;
  amount: bigint;
  nonce: string; // bytes32
  deadline: bigint; // unix timestamp
};

export function buildWithdrawDomain(params: { name?: string; version?: string; chainId?: number; verifyingContract: string }): TypedDataDomain {
  return {
    name: params.name ?? "TRUDE Withdraw",
    version: params.version ?? "1",
    chainId: params.chainId,
    verifyingContract: params.verifyingContract,
  };
}

export const withdrawTypes: Record<string, Array<TypedDataField>> = {
  Withdraw: [
    { name: "user", type: "address" },
    { name: "vault", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "bytes32" },
    { name: "deadline", type: "uint256" },
  ],
};

export async function verifyWithdrawSignature(domain: TypedDataDomain, data: WithdrawTypedData, signature: string): Promise<string> {
  const signer = verifyTypedData(domain, withdrawTypes, data, signature);
  return signer;
}

export function computeRequestHash(domain: TypedDataDomain, data: WithdrawTypedData): string {
  return TypedDataEncoder.hash(domain, withdrawTypes, data);
}