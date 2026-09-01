"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/app/lib/api";

type Customer = { id: string; name: string };
type Deal = {
  id: string;
  title: string;
  value: number;
  status: string;
  customer: { name: string };
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "NEGOTIATING", "WON", "LOST"];

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

  const statusColors: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    CONTACTED: "bg-blue-100 text-blue-700",
    NEGOTIATING: "bg-yellow-100 text-yellow-700",
    WON: "bg-green-100 text-green-700",
    LOST: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <h1 className="text-xl font-bold text-gray-900">CRM</h1>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
            Dashboard
          </Link>
          <Link href="/leads" className="text-sm text-gray-600 hover:underline">
            Leads
          </Link>
          <Link href="/customers" className="text-sm text-gray-600 hover:underline">
            Customers
          </Link>
          <Link href="/deals" className="text-sm text-blue-600 font-medium">
            Deals
          </Link>
        </div>
      </nav>

      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals</h2>

        {customers.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded mb-4">
            You need at least one customer before creating a deal.{" "}
            <Link href="/customers" className="underline">
              Add one here
            </Link>
            .
          </p>
        ) : (
          <form
            onSubmit={handleAddDeal}
            className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-2 gap-3"
          >
            <input
              type="text"
              placeholder="Deal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-gray-900"
              required
            />
            <input
              type="number"
              placeholder="Value ($)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-gray-900"
            />
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 col-span-2"
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
              className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Deal"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-gray-500">No deals yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{d.title}</td>
                    <td className="px-4 py-2 text-gray-600">{d.customer?.name}</td>
                    <td className="px-4 py-2 text-gray-600">
                      ${d.value.toLocaleString()}
                    </td>
                                        <td className="px-4 py-2">
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${statusColors[d.status]}`}
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