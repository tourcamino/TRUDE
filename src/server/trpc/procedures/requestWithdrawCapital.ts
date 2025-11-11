import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { enforcePolicy } from "~/server/utils/policies";
import { buildWithdrawDomain, verifyWithdrawSignature, computeRequestHash } from "~/server/utils/eip712";
import { env } from "~/server/env";
import { buildWithdrawCalldata } from "~/server/utils/onchain";

export const requestWithdrawCapital = baseProcedure
  .input(
    z.object({
      mode: z.enum(["auto", "eip712", "customer"]),
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      vaultId: z.number(),
      amount: z.string().regex(/^\d+$/, "Amount must be a valid number string"),
      executeNow: z.boolean().optional(),
      // EIP-712 specific
      signature: z.string().optional(),
      nonce: z.string().regex(/^0x[0-9a-fA-F]{64}$/).optional(),
      deadline: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const vault = await db.vault.findUnique({ where: { id: input.vaultId } });
    if (!vault) throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });

    const user = await db.user.findUnique({ where: { address: input.userAddress } });
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    const requested = BigInt(input.amount);
    if (requested <= 0n) throw new TRPCError({ code: "BAD_REQUEST", message: "Amount must be greater than zero" });

    // Compute available principal for this user in this vault
    const deposits = await db.deposit.findMany({ where: { userId: user.id, vaultId: vault.id } });
    const withdrawals = await db.capitalWithdrawal.findMany({ where: { userId: user.id, vaultId: vault.id } });
    const totalDeposits = deposits.reduce((acc: bigint, d: { amount: string }) => acc + BigInt(d.amount), 0n);
    const totalWithdrawals = withdrawals.reduce((acc: bigint, w: { amount: string }) => acc + BigInt(w.amount), 0n);
    const available = totalDeposits - totalWithdrawals;
    if (requested > available) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient available principal" });

    // Prepare basic audit details
    const baseAudit = { userAddress: input.userAddress, vaultId: vault.id, amount: input.amount, mode: input.mode };

    // If mode is auto, enforce upgradable policy (allowlist, per-tx, daily limits)
    // Customer mode bypasses policy to allow self-withdraw anytime (client pays gas)
    if (input.mode === "auto") {
      const policyCheck = await enforcePolicy({
        userId: user.id,
        vaultAddress: vault.address,
        amount: requested,
      });
      if (!policyCheck.ok) {
        await db.auditLog.create({
          data: {
            action: "REQUEST_WITHDRAW",
            status: "REJECTED",
            userId: user.id,
            vaultId: vault.id,
            details: { ...baseAudit, reason: `POLICY_${policyCheck.reason}` },
          },
        });
        throw new TRPCError({ code: "FORBIDDEN", message: `Policy enforcement failed: ${policyCheck.reason}` });
      }
    }

    // If EIP-712, verify signature and deadline
    if (input.mode === "eip712") {
      if (!input.signature || !input.nonce || !input.deadline) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing signature, nonce or deadline for EIP-712 mode" });
      }
      const now = Math.floor(Date.now() / 1000);
      if (input.deadline <= now) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Request deadline has passed" });
      }
      const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
      const domain = buildWithdrawDomain({ chainId, verifyingContract: vault.address });
      const signer = await verifyWithdrawSignature(domain, {
        user: input.userAddress,
        vault: vault.address,
        amount: requested,
        nonce: input.nonce,
        deadline: BigInt(input.deadline),
      }, input.signature);
      if (signer.toLowerCase() !== input.userAddress.toLowerCase()) {
        await db.auditLog.create({ data: { action: "REQUEST_WITHDRAW", status: "REJECTED", details: { ...baseAudit, reason: "INVALID_SIGNATURE" } } });
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid EIP-712 signature" });
      }
    }

    // Create request record
    const requestHash = (() => {
      if (input.mode === "eip712") {
        const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
        const domain = buildWithdrawDomain({ chainId, verifyingContract: vault.address });
        // We already verified earlier; recompute the digest to persist
        const digest = computeRequestHash(domain, {
          user: input.userAddress,
          vault: vault.address,
          amount: requested,
          nonce: input.nonce!,
          deadline: BigInt(input.deadline!),
        });
        return digest;
      }
      return `${vault.address}-${input.userAddress}-${input.amount}-${Date.now()}`;
    })();

    const request = await db.withdrawalRequest.create({
      data: {
        userId: user.id,
        vaultId: vault.id,
        amount: input.amount,
        mode: input.mode,
        status: "PENDING",
        onChain: false,
        requestHash,
        signature: input.signature,
        deadline: input.deadline ? new Date(input.deadline * 1000) : undefined,
      },
    });

    await db.auditLog.create({ data: { action: "REQUEST_WITHDRAW", status: "PENDING", userId: user.id, vaultId: vault.id, requestId: request.id, details: baseAudit } });

    // Always return prepared transaction for client-side broadcast (gas paid by client)
    const chainId = env.CHAIN_ID ? Number(env.CHAIN_ID) : undefined;
    const preparedTx = {
      to: vault.address,
      data: buildWithdrawCalldata(requested),
      value: "0x0",
      chainId,
    };

    return { success: true, request, preparedTx };
  });