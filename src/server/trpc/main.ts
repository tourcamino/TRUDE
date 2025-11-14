import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.create({
  transformer: superjson,
  sse: {
    enabled: true,
    client: {
      reconnectAfterInactivityMs: 5000,
    },
    ping: {
      enabled: true,
      intervalMs: 2500,
    },
  },
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const rateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 60;

const rateLimit = t.middleware(async ({ ctx, next }) => {
  const ip = (ctx as any)?.ip || "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count++;
  rateMap.set(ip, entry);
  if (entry.count > LIMIT) {
    throw new Error("Too many requests");
  }
  return next();
});

export const baseProcedure = t.procedure.use(rateLimit);

const adminGuard = t.middleware(async ({ ctx, next }) => {
  const token = (ctx as any)?.adminToken;
  const expected = process.env.TRPC_ADMIN_TOKEN || "admin123";
  if (!token || token !== expected) {
    throw new Error("Admin authorization required");
  }
  return next();
});

export const adminProcedure = baseProcedure.use(adminGuard);
