import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <Outlet />
    </div>
  ),
});
