"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/app/lib/api";
import Sidebar from "@/app/components/Sidebar";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadCustomers() {
    const res = await authFetch("/api/customers");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await authFetch("/api/customers", {
      method: "POST",
      body: JSON.stringify({ name, email, phone }),
    });

    if (res.ok) {
      setName("");
      setEmail("");
      setPhone("");
      await loadCustomers();
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10 max-w-4xl">
        <h2 className="font-serif-display text-3xl text-ink mb-6">Customers</h2>

        <form
          onSubmit={handleAddCustomer}
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
            className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary col-span-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-primary text-paper py-2 rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Customer"}
          </button>
        </form>

        {loading ? (
          <p className="text-muted">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-muted">No customers yet. Add your first one above.</p>
        ) : (
          <div className="bg-white border border-line rounded-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Name</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Email</th>
                  <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-4 py-3 text-ink">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-muted">{c.phone || "—"}</td>
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