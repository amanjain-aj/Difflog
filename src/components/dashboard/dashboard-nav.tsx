"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  Layers,
  LogOut,
  PlayCircle,
  Terminal,
  UserCircle2,
} from "lucide-react";
import { UserAccount } from "@/lib/db/types";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Projects & Releases",
      icon: Layers,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/simulator",
      label: "CI Ingestion Simulator",
      icon: PlayCircle,
      active: pathname === "/dashboard/simulator",
    },
    {
      href: "/dashboard/billing",
      label: "Billing & Plan",
      icon: CreditCard,
      active: pathname === "/dashboard/billing",
    },
    {
      href: "/dashboard/profile",
      label: "User & Team Panel",
      icon: UserCircle2,
      active: pathname === "/dashboard/profile",
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#090A0F]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-bold text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Terminal className="h-4 w-4" />
            </span>
            <span>DiffLog</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              ADMIN
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    item.active
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/acme-payments"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            <span>Public Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs text-zinc-200 hover:border-zinc-700"
            title="Open User & Team Panel"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 font-mono text-[10px] font-bold text-indigo-300">
              {user?.avatar_initials || "AJ"}
            </span>
            <span className="hidden lg:inline font-medium">
              {user?.full_name || "Aman Jain"}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-rose-500/30 hover:text-rose-300 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
