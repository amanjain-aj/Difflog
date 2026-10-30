"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  Sparkles,
  Terminal,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("founder@difflog.dev");
  const [password, setPassword] = useState("difflog2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#090A0F] px-6 py-12 text-zinc-100">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Terminal className="h-5 w-5" />
            </span>
            <span>DiffLog</span>
          </Link>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
            Sign in to your developer portal
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400">
            Manage your OpenAPI changelog portals, SHA-256 CI keys, and team
            access.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6 shadow-2xl">
          {/* Quick Demo Credentials Banner */}
          <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-950/25 p-3.5 text-xs">
            <div className="flex items-center justify-between font-medium text-indigo-300">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pre-seeded Demo Accounts</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail("founder@difflog.dev");
                  setPassword("difflog2026");
                }}
                className="font-mono text-[11px] underline hover:text-white"
              >
                Fill Founder Admin
              </button>
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-zinc-400">
              Admin: <span className="text-zinc-200">founder@difflog.dev</span>{" "}
              • Member:{" "}
              <button
                type="button"
                onClick={() => {
                  setEmail("devrel@acmepayments.dev");
                  setPassword("difflog2026");
                }}
                className="text-zinc-200 underline hover:text-white"
              >
                devrel@acmepayments.dev
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.dev"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase text-zinc-400">
                  Password
                </label>
                <span className="text-[11px] text-zinc-500">
                  Supabase Auth / Local Session
                </span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              <span>{loading ? "Signing in..." : "Sign in to DiffLog"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800/80 pt-5 text-center text-xs text-zinc-400">
            Don&apos;t have a DiffLog organization yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Create a developer account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
