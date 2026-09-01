"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/app/lib/api";
import Sidebar from "@/app/components/Sidebar";

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
      await loadLeads();
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10 max-w-4xl">
        <h2 className="font-serif-display text-3xl text-ink mb-6">Leads</h2>

        <form
          onSubmit={handleAddLead}
          className="bg-white border border-line rounded-sm p-5 mb-8 grid grid-cols-2 gap-3"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Source (e.g. Website, Referral)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-primary text-paper py-2 rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Lead"}
          </button>
        </form>

        {loading ? (
          <p className="text-muted">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="text-muted">No leads yet. Add your first one above.</p>
        ) : (
          <div className="bg-white border border-line rounded-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Name</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Email</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Phone</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-line">
                    <td className="px-4 py-3 text-ink">{lead.name}</td>
                    <td className="px-4 py-3 text-muted">{lead.email || "—"}</td>
                    <td className="px-4 py-3 text-muted">{lead.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted">{lead.source || "—"}</td>
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