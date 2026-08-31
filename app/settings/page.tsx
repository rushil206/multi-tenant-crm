"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch } from "@/app/lib/api";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const ROLE_OPTIONS = ["ADMIN", "SALES_MANAGER", "SALES_REP"];

export default function SettingsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("SALES_REP");
  const [inviteLink, setInviteLink] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  async function loadMembers() {
    const res = await authFetch("/api/organization/members");

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setMembers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    setInviteLink("");

    const res = await authFetch("/api/organization/invite", {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });

    const data = await res.json();

    if (!res.ok) {
      setInviteError(data.error || "Something went wrong");
      setInviting(false);
      return;
    }

    setInviteLink(data.inviteLink);
    setInviteEmail("");
    setInviting(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard!");
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
          <Link href="/customers" className="text-sm text-gray-600 hover:underline">
            Customers
          </Link>
          <Link href="/deals" className="text-sm text-gray-600 hover:underline">
            Deals
          </Link>
          <Link href="/settings" className="text-sm text-blue-600 font-medium">
            Settings
          </Link>
        </div>
      </nav>

      <main className="p-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : forbidden ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-700 font-medium">Access restricted</p>
            <p className="text-gray-500 text-sm mt-1">
              Only Owners and Admins can view team settings.
            </p>
          </div>
        ) : (
          <>
            {/* Invite form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Invite a teammate</h3>

              {inviteError && (
                <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">
                  {inviteError}
                </div>
              )}

              {inviteLink && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <p className="text-green-800 mb-2">
                    Invite created! Share this link with them:
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 bg-gray-50"
                    />
                    <button
                      onClick={copyLink}
                      className="text-xs bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleInvite} className="flex gap-3">
                <input
                  type="email"
                  placeholder="teammate@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-900"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Invite"}
                </button>
              </form>
            </div>

            {/* Team member list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-2 text-gray-900">{m.name}</td>
                      <td className="px-4 py-2 text-gray-600">{m.email}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {m.role.replace("_", " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}