"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/app/lib/api";
import Sidebar from "@/app/components/Sidebar";

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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10">
        <h2 className="font-serif-display text-3xl text-ink mb-1">
          Welcome, {user?.name}
        </h2>
        <p className="text-muted text-sm mb-8">
          {user?.role.replace("_", " ")} · {user?.email}
        </p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total Leads" value={stats.totalLeads} />
            <StatCard label="Total Customers" value={stats.totalCustomers} />
            <StatCard label="Total Deals" value={stats.totalDeals} />
            <StatCard label="Deals Won" value={stats.dealsWon} accent="text-primary" />
            <StatCard label="Deals Lost" value={stats.dealsLost} accent="text-danger" />
            <StatCard
              label="Open Pipeline Value"
              value={`$${stats.openPipelineValue.toLocaleString()}`}
              accent="text-gold"
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
  accent = "text-ink",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-line rounded-sm p-5 border-t-2 border-t-primary">
      <p className="text-xs text-muted uppercase tracking-wide mb-2">{label}</p>
      <p className={`font-serif-display text-3xl ${accent}`}>{value}</p>
    </div>
  );
}