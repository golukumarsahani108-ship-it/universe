"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "⌂",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: "♙",
  },
  {
    name: "Websites",
    href: "/admin/websites",
    icon: "◫",
  },
  {
    name: "Website Templates",
    href: "/admin/websites/templates",
    icon: "✦",
  },
  {
    name: "Add Website",
    href: "/admin/websites/add",
    icon: "+",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: "⌁",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: "⚙",
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-shell-theme min-h-screen overflow-x-hidden text-slate-800">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-120px] top-1/4 h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-[-150px] left-1/3 h-[420px] w-[420px] rounded-full bg-blue-400/5 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.08),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08),transparent_30%)]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 w-[280px]",
            "border-r border-white/[0.08]",
            "bg-white/70 backdrop-blur-2xl",
            "shadow-[20px_0_60px_rgba(0,0,0,0.18)]",
            "transition-transform duration-300 ease-out",
            "lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-full flex-col p-5">
            {/* Brand */}
            <div className="mb-8 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/90 to-blue-600/90 text-lg shadow-lg shadow-pink-500/10">
                  ♡
                </div>

                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-700">
                    My Little Universe
                  </div>

                  <div className="mt-1 text-base font-semibold text-white">
                    Master Admin
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />

                <span className="text-xs text-white/40">
                  Platform online
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
              Workspace
            </div>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "group relative flex items-center gap-3 rounded-2xl px-4 py-3.5",
                      "border transition-all duration-200",
                      active
                        ? "border-white/[0.10] bg-gradient-to-r from-pink-500/[0.14] to-blue-500/[0.08] text-white shadow-lg shadow-pink-500/[0.03]"
                        : "border-transparent text-white/45 hover:border-white/[0.06] hover:bg-white/[0.045] hover:text-white",
                    ].join(" ")}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
                    )}

                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl text-base transition",
                        active
                          ? "bg-white/[0.10] text-cyan-700"
                          : "bg-white/[0.035] text-white/40 group-hover:bg-white/[0.07] group-hover:text-white",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>

                    <span className="text-sm font-medium">
                      {item.name}
                    </span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="mt-auto space-y-2">
              <div className="mb-3 h-px bg-white/[0.07]" />

              <Link
                href="/admin/settings"
                onClick={() => setMobileOpen(false)}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3.5 text-sm text-white/45 transition hover:border-white/[0.06] hover:bg-white/[0.045] hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-sm text-white/40 group-hover:bg-white/[0.07] group-hover:text-white">
                  ◉
                </span>

                <span>Admin Profile</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3.5 text-left text-sm text-white/40 transition hover:border-red-400/10 hover:bg-red-500/[0.06] hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-sm group-hover:bg-red-500/10">
                  ↪
                </span>

                <span>
                  {loggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-[280px]">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-white/75 backdrop-blur-2xl">
            <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
                  aria-label="Open menu"
                >
                  ☰
                </button>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/25">
                    My Little Universe
                  </div>

                  <div className="mt-1 text-sm font-medium text-white/65">
                    Platform Administration
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-white/40">
                    All systems operational
                  </span>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-sm">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="relative flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}