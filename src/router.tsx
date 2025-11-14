import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./generated/tanstack-router/routeTree.gen";

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPendingComponent: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading TRUDE...</span>
      </div>
    ),
    // Code splitting optimization
    defaultErrorComponent: ({ error }) => (
      <div className="p-4 text-red-600">
        <h2 className="text-lg font-semibold">Error Loading Page</h2>
        <p className="text-sm">{error.message}</p>
      </div>
    ),
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
