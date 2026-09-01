"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/app/lib/api";
import Sidebar from "@/app/components/Sidebar";

type Customer = { id: string; name: string };
type Deal = {
  id: string;
  title: string;
  value: number;
  status: string;
  customer: { name: string };
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "NEGOTIATING", "WON", "LOST"];

const statusStyles: Record<string, string> = {
  NEW: "bg-ink/5 text-muted",
  CONTACTED: "bg-primary/10 text-primary",
  NEGOTIATING: "bg-gold/20 text-ink",
  WON: "bg-primary text-paper",
  LOST: "bg-danger/10 text-danger",
};

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    const [dealsRes, customersRes] = await Promise.all([
      authFetch("/api/deals"),
      authFetch("/api/customers"),
    ]);

    if (dealsRes.status === 401) {
      router.push("/login");
      return;
    }

    const dealsData = await dealsRes.json();
    const customersData = await customersRes.json();

    setDeals(dealsData);
    setCustomers(customersData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      alert("Please select a customer");
      return;
    }
    setSubmitting(true);

    const res = await authFetch("/api/deals", {
      method: "POST",
      body: JSON.stringify({
        title,
        value: parseFloat(value) || 0,
        customerId,
      }),
    });

    if (res.ok) {
      setTitle("");
      setValue("");
      setCustomerId("");
      await loadData();
    }
    setSubmitting(false);
  }

  async function handleStatusChange(dealId: string, newStatus: string) {
    const res = await authFetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      await loadData();
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10 max-w-4xl">
        <h2 className="font-serif-display text-3xl text-ink mb-6">Deals</h2>

        {customers.length === 0 ? (
          <p className="text-sm text-gold bg-gold/10 border border-gold/30 p-3 rounded-sm mb-6">
            You need at least one customer before creating a deal.{" "}
            <Link href="/customers" className="underline">
              Add one here
            </Link>
            .
          </p>
        ) : (
          <form
            onSubmit={handleAddDeal}
            className="bg-white border border-line rounded-sm p-5 mb-8 grid grid-cols-2 gap-3"
          >
            <input
              type="text"
              placeholder="Deal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
              required
            />
            <input
              type="number"
              placeholder="Value ($)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
            />
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary col-span-2"
              required
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="col-span-2 bg-primary text-paper py-2 rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Deal"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-muted">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-muted">No deals yet.</p>
        ) : (
          <div className="bg-white border border-line rounded-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Title</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Customer</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Value</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="px-4 py-3 text-ink">{d.title}</td>
                    <td className="px-4 py-3 text-muted">{d.customer?.name}</td>
                    <td className="px-4 py-3 font-serif-display text-ink">
                      ${d.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusStyles[d.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}