import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  ALKEMY_API_KEY: z.string(),
  DUNE_API_KEY: z.string(),
  MORALIS_API_KEY: z.string(),
  METAMASK_API_KEY: z.string(),
  METAMASK_API_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
