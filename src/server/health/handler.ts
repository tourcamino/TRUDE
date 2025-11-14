import { defineEventHandler } from "h3";
import { env } from "~/server/env";
import { db } from "~/server/db";

export default defineEventHandler(async () => {
  try {
    let databaseOk = false;
    let databasePingMs: number | null = null;
    if (process.env.DATABASE_URL) {
      const t0 = Date.now();
      await db.$queryRaw`SELECT 1`;
      databasePingMs = Date.now() - t0;
      databaseOk = true;
    }
    const payload = {
      ok: true,
      nodeEnv: env.NODE_ENV,
      baseUrl: env.BASE_URL ?? null,
      chainId: env.CHAIN_ID ? Number(env.CHAIN_ID) : null,
      databaseUrlPresent: !!process.env.DATABASE_URL,
      databaseOk,
      databasePingMs,
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    const payload = {
      ok: false,
      message: error?.message || "Unhandled health check error",
    };
    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
);
