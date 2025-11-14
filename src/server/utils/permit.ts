import { Interface } from "ethers";

export type EIP2612Permit = {
  owner: string;
  spender: string;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
};

export type EIP2612Signature = {
  v: number;
  r: string; // 0x...
  s: string; // 0x...
};

const erc20PermitIface = new Interface([
  "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)",
  "function nonces(address owner) view returns (uint256)",
]);

export function buildPermitCalldata(permit: EIP2612Permit, sig: EIP2612Signature): string {
  return erc20PermitIface.encodeFunctionData("permit", [
    permit.owner,
    permit.spender,
    permit.value,
    permit.deadline,
    sig.v,
    sig.r,
    sig.s,
  ]);
}

export const buildPermitTypedData = (
  tokenName: string,
  tokenAddress: string,
  chainId: number,
  permit: Omit<EIP2612Permit, "nonce"> & { nonce?: bigint },
) => {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    domain: {
      name: tokenName,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    },
    primaryType: "Permit",
    message: {
      owner: permit.owner,
      spender: permit.spender,
      value: permit.value.toString(),
      nonce: (permit.nonce ?? 0n).toString(),
      deadline: permit.deadline.toString(),
    },
  } as const;
};