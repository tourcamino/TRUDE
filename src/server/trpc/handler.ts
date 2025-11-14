import { defineEventHandler, getRequestURL, getRequestHeaders, readRawBody } from "h3";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method || "GET";
    const url = getRequestURL(event);
    const headersObj = getRequestHeaders(event);
    const headers = new Headers(headersObj as Record<string, string>);

    let body: BodyInit | undefined;
    if (method !== "GET" && method !== "HEAD") {
      // Read raw body as UTF-8 string to avoid instanceof checks on union types
      const raw = (await readRawBody(event, "utf8")) as string | null;
      if (raw !== null) {
        body = raw;
      }
    }

    const request = new Request(url, { method, headers, body });

    // Import dynamically to ensure any top-level import errors are caught and surfaced as JSON
    const { appRouter } = await import("./root");

    const response = await fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext() {
        const ipHeader = headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
        const ip = (ipHeader.split(",")[0] || (event.node.req.socket as any)?.remoteAddress || "").trim();
        const auth = headers.get("authorization") || "";
        const adminToken = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
        return { ip, adminToken } as any;
      },
      onError({ error, path }) {
        console.error(`tRPC error on '${path}':`, error);
      },
    });

    return response;
  } catch (error: any) {
    console.error("tRPC handler fatal error:", error);
    const payload = {
      ok: false,
      message: error?.message || "Unhandled server error",
    };
    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
