"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/customers", label: "Customers" },
  { href: "/deals", label: "Deals" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  let userName = "";
  let userRole = "";
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      userName = parsed.name;
      userRole = parsed.role;
    }
  }

  return (
    <aside className="w-60 shrink-0 bg-ink text-paper min-h-screen flex flex-col">
      <div className="px-6 py-7">
        <h1 className="font-serif-display text-2xl text-gold tracking-tight">
          Ledger
        </h1>
        <p className="text-xs text-paper/50 mt-0.5">CRM</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 mb-1 rounded-sm text-sm border-l-2 transition-colors ${
                active
                  ? "border-gold bg-white/5 text-paper font-medium"
                  : "border-transparent text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-sm text-paper truncate">{userName}</p>
        <p className="text-xs text-paper/50 mb-3">{userRole?.replace("_", " ")}</p>
        <button
          onClick={handleLogout}
          className="text-xs text-paper/60 hover:text-gold transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}