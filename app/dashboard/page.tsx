"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/app/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Stats = {
  totalLeads: number;
  totalCustomers: number;
  totalDeals: number;
  dealsWon: number;
  dealsLost: number;
  openPipelineValue: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    loadStats();
    setChecking(false);
  }, [router]);

  async function loadStats() {
    const res = await authFetch("/api/dashboard/stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <h1 className="text-xl font-bold text-gray-900">CRM</h1>
          <a href="/dashboard" className="text-sm text-blue-600 font-medium">
            Dashboard
          </a>
          <a href="/leads" className="text-sm text-gray-600 hover:underline">
            Leads
          </a>
          <a href="/customers" className="text-sm text-gray-600 hover:underline">
            Customers
          </a>
          <a href="/deals" className="text-sm text-gray-600 hover:underline">
            Deals
          </a>
          <a href="/settings" className="text-sm text-gray-600 hover:underline">
            Settings
          </a>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Log out
        </button>
      </nav>

      <main className="p-6 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Welcome, {user?.name} 👋
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {user?.role.replace("_", " ")} · {user?.email}
        </p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Leads" value={stats.totalLeads} />
            <StatCard label="Total Customers" value={stats.totalCustomers} />
            <StatCard label="Total Deals" value={stats.totalDeals} />
            <StatCard label="Deals Won" value={stats.dealsWon} color="text-green-600" />
            <StatCard label="Deals Lost" value={stats.dealsLost} color="text-red-600" />
            <StatCard
              label="Open Pipeline Value"
              value={`$${stats.openPipelineValue.toLocaleString()}`}
              color="text-blue-600"
            />
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}