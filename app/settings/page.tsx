"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/app/lib/api";
import Sidebar from "@/app/components/Sidebar";

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
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10 max-w-3xl">
        <h2 className="font-serif-display text-3xl text-ink mb-6">Team Settings</h2>

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : forbidden ? (
          <div className="bg-white border border-line rounded-sm p-8 text-center">
            <p className="text-ink font-medium">Access restricted</p>
            <p className="text-muted text-sm mt-1">
              Only Owners and Admins can view team settings.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-line rounded-sm p-5 mb-8">
              <h3 className="font-medium text-ink mb-3">Invite a teammate</h3>

              {inviteError && (
                <div className="mb-3 p-3 bg-danger/10 text-danger rounded-sm text-sm">
                  {inviteError}
                </div>
              )}

              {inviteLink && (
                <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-sm text-sm">
                  <p className="text-primary mb-2">
                    Invite created! Share this link with them:
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 border border-line rounded-sm px-2 py-1 text-xs text-muted bg-paper"
                    />
                    <button
                      onClick={copyLink}
                      className="text-xs bg-ink text-paper px-3 py-1.5 rounded-sm hover:bg-primary-dark transition-colors"
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
                  className="flex-1 border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="border border-line rounded-sm px-3 py-2 text-ink bg-paper focus:outline-none focus:border-primary"
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
                  className="bg-primary text-paper px-4 py-2 rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Invite"}
                </button>
              </form>
            </div>

            <div className="bg-white border border-line rounded-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-line">
                  <tr>
                    <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Name</th>
                    <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Email</th>
                    <th className="px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members?.map((m) => (
                    <tr key={m.id} className="border-t border-line">
                      <td className="px-4 py-3 text-ink">{m.name}</td>
                      <td className="px-4 py-3 text-muted">{m.email}</td>
                      <td className="px-4 py-3 text-muted">{m.role.replace("_", " ")}</td>
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