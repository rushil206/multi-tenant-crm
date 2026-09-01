"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/app/lib/api";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  createdAt: string;
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields for adding a new lead
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadLeads() {
    const res = await authFetch("/api/leads");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await authFetch("/api/leads", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, source }),
    });

    if (res.ok) {
      setName("");
      setEmail("");
      setPhone("");
      setSource("");
      await loadLeads(); // refresh the list
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <h1 className="text-xl font-bold text-gray-900">CRM</h1>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
            Dashboard
          </Link>
          <Link href="/leads" className="text-sm text-blue-600 font-medium">
            Leads
          </Link>
          <Link href="/customers" className="text-sm text-gray-600 hover:underline">
            Customers
          </Link>
                    <Link href="/deals" className="text-sm text-gray-600 hover:underline">
            Deals
          </Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:underline">
            Settings
          </Link>
        </div>
      </nav>

      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads</h2>

        <form
          onSubmit={handleAddLead}
          className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-2 gap-3"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
          />
          <input
            type="text"
            placeholder="Source (e.g. Website, Referral)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
          />
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Lead"}
          </button>
        </form>

        {loading ? (
          <p className="text-gray-500">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="text-gray-500">No leads yet. Add your first one above.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{lead.name}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.email || "-"}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.phone || "-"}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.source || "-"}</td>
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