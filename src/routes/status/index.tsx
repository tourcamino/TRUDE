import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "~/components/Navbar";
import { setPageTitle } from "~/utils/seo";

export const Route = createFileRoute("/status/")({
  component: StatusPage,
});

function StatusPage() {
  const [health, setHealth] = useState<any>(null);
  useEffect(() => { setPageTitle("TRUDE • System Status"); (async () => { try { const res = await fetch("/api/health"); const json = await res.json(); setHealth(json); } catch {} })(); }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-600">Node Env</p>
            <p className="text-2xl font-semibold">{health?.nodeEnv ?? "-"}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-600">Chain ID</p>
            <p className="text-2xl font-semibold">{health?.chainId ?? "-"}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-600">Database</p>
            <p className="text-2xl font-semibold">{health?.databaseOk ? "OK" : "Unavailable"}</p>
            <p className="text-sm text-gray-500">Ping: {health?.databasePingMs ?? "-"} ms</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-600">Base URL</p>
            <p className="text-2xl font-semibold">{health?.baseUrl ?? "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}