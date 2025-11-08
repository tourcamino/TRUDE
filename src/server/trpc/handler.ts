import { defineEventHandler, getRequestURL, getRequestHeaders, readRawBody } from "h3";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./root";

export default defineEventHandler(async (event) => {
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

  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: appRouter,
    createContext() {
      return {};
    },
    onError({ error, path }) {
      console.error(`tRPC error on '${path}':`, error);
    },
  });
});
