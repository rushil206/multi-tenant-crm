"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          organizationName: inviteToken ? undefined : organizationName,
          inviteToken: inviteToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("Could not connect to the server");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif-display text-3xl text-gold text-center mb-8">
          Ledger
        </h1>

        <div className="bg-paper p-8 rounded-sm">
          <h2 className="text-lg font-medium text-ink mb-1">
            {inviteToken ? "Join your team" : "Create your account"}
          </h2>

          {inviteToken && (
            <p className="text-sm text-primary bg-primary/5 border border-primary/20 p-3 rounded-sm mb-4 mt-3">
              You&apos;ve been invited to join an organization.
            </p>
          )}

          {error && (
            <div className="mt-4 mb-4 p-3 bg-danger/10 text-danger rounded-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {!inviteToken && (
              <div>
                <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full border border-line rounded-sm px-3 py-2 text-ink bg-white focus:outline-none focus:border-primary"
                  placeholder="Acme Inc."
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-ink bg-white focus:outline-none focus:border-primary"
                placeholder="Rushil Sharma"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-ink bg-white focus:outline-none focus:border-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-ink bg-white focus:outline-none focus:border-primary"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-paper py-2.5 rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-sm text-muted text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <SignupForm />
    </Suspense>
  );
}