// EIP-712 typed data helper for custodial/enterprise off-chain signing flows
// This is a scaffold to be used by API integrators and wallet providers.

export type WithdrawalAuthorizationData = {
  user: string; // user address
  vaultId: number; // off-chain vault id reference
  amount: string; // string in smallest units
  nonce: string; // hex string
  deadline: number; // unix timestamp
};

export function buildWithdrawalAuthorizationTypedData({
  chainId,
  verifyingContract,
  data,
}: {
  chainId: number;
  verifyingContract: string;
  data: WithdrawalAuthorizationData;
}) {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      WithdrawalAuthorization: [
        { name: "user", type: "address" },
        { name: "vaultId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "bytes32" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "WithdrawalAuthorization",
    domain: {
      name: "TRUDE",
      version: "1",
      chainId,
      verifyingContract,
    },
    message: {
      user: data.user,
      vaultId: data.vaultId,
      amount: data.amount,
      nonce: data.nonce,
      deadline: data.deadline,
    },
  } as const;
}