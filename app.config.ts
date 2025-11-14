import { createApp } from "vinxi";
import reactRefresh from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { config } from "vinxi/plugins/config";
import { env } from "./src/server/env";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { consoleForwardPlugin } from "./vite-console-forward-plugin";

export default createApp({
  server: {
    preset: "node-server", // change to 'netlify' or 'bun' or anyof the supported presets for nitro (nitro.unjs.io)
    experimental: {
      asyncContext: true,
    },
  },
  // Bundle optimization
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom', '@tanstack/react-query', '@tanstack/react-router'],
          'vendor-ui': ['lucide-react', 'class-variance-authority', 'clsx'],
          'vendor-web3': ['viem', 'wagmi', '@web3modal/wagmi'],
          'vendor-ai': ['ai', '@ai-sdk/openai', '@ai-sdk/anthropic'],
          // Route chunks
          'dashboard': ['./src/routes/dashboard'],
          'developers': ['./src/routes/developers'],
          'api-docs': ['./src/routes/api-documentation'],
        },
      },
    },
  },
  routers: [
    {
      type: "static",
      name: "public",
      dir: "./public",
    },
    {
      type: "http",
      name: "trpc",
      base: "/trpc",
      handler: "./src/server/trpc/handler.ts",
      target: "server",
      plugins: () => [
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: env.BASE_URL
              ? [env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
      ],
    },
    {
      type: "http",
      name: "debug",
      base: "/api/debug/client-logs",
      handler: "./src/server/debug/client-logs-handler.ts",
      target: "server",
      plugins: () => [
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: env.BASE_URL
              ? [env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
      ],
    },
    {
      type: "http",
      name: "health",
      base: "/api/health",
      handler: "./src/server/health/handler.ts",
      target: "server",
      plugins: () => [
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: env.BASE_URL
              ? [env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
      ],
    },
    {
      type: "spa",
      name: "client",
      handler: "./index.html",
      target: "browser",
      plugins: () => [
        config("allowedHosts", {
          // @ts-ignore
          server: {
            allowedHosts: env.BASE_URL
              ? [env.BASE_URL.split("://")[1]]
              : undefined,
          },
        }),
        tsConfigPaths({
          projects: ["./tsconfig.json"],
        }),
        TanStackRouterVite({
          target: "react",
          autoCodeSplitting: true,
          routesDirectory: "./src/routes",
          generatedRouteTree: "./src/generated/tanstack-router/routeTree.gen.ts",
        }),
        reactRefresh(),
        nodePolyfills(),
        consoleForwardPlugin({
          enabled: process.env.NODE_ENV !== "production",
          endpoint: "/api/debug/client-logs",
          levels: ["log", "warn", "error", "info", "debug"],
        }),
      ],
    },
  ],
});
