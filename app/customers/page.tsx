"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/app/lib/api";

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
          <Link href="/customers" className="text-sm text-blue-600 font-medium">
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customers</h2>

        <form
          onSubmit={handleAddCustomer}
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
            className="border border-gray-300 rounded px-3 py-2 text-gray-900 col-span-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Customer"}
          </button>
        </form>

        {loading ? (
          <p className="text-gray-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-500">No customers yet. Add your first one above.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{c.name}</td>
                    <td className="px-4 py-2 text-gray-600">{c.email || "-"}</td>
                    <td className="px-4 py-2 text-gray-600">{c.phone || "-"}</td>
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