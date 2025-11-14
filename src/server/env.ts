import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  // Optional in development; provide via real secrets in staging/prod
  ADMIN_PASSWORD: z.string().optional(),
  ALKEMY_API_KEY: z.string().optional(),
  DUNE_API_KEY: z.string().optional(),
  MORALIS_API_KEY: z.string().optional(),
  METAMASK_API_KEY: z.string().optional(),
  METAMASK_API_SECRET: z.string().optional(),
  // On-chain execution support
  CHAIN_RPC_URL: z.string().optional(),
  CHAIN_ID: z.string().optional(),
  SERVICE_SIGNER_PRIVATE_KEY: z.string().optional(),
  AUTOMATIC_WITHDRAW_ENABLED: z.string().optional(),
  // Admin token for TRPC protected procedures (dev/staging)
  TRPC_ADMIN_TOKEN: z.string().optional(),
  // AI Provider API Keys
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OPEN_ROUTER_API_KEY: z.string().optional(),
  // Prisma datasource — optional here; Prisma reads process.env.DATABASE_URL directly
  DATABASE_URL: z.string().optional(),
  // Factory contract address
  FACTORY_ADDRESS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
