"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      // No token found — this user never logged in, send them away
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    setChecking(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  // While we're checking for the token, show nothing (avoids a flash of content)
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Log out
        </button>
      </nav>

      <main className="p-6">
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome, {user?.name} 👋
          </h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: {user?.role}</p>
        </div>
      </main>
    </div>
  );
}