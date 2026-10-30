"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  Layers,
  PlayCircle,
  Terminal,
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();

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

          <nav className="flex items-center gap-1">
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

        <div className="flex items-center gap-3">
          <Link
            href="/acme-payments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            <span>View Public Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
