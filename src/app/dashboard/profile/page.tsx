"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  LogOut,
  Mail,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Organization, UserAccount } from "@/lib/db/types";
import { formatRelativeDate } from "@/lib/utils";

export default function UserPanelProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Invite team member form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);

  const loadUserContext = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user);
      setOrganization(data.organization);
      setMembers(data.members || []);
      if (data.user) {
        setFullName(data.user.full_name);
        setEmail(data.user.email);
      }
      if (data.organization) {
        setOrgName(data.organization.name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserContext();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setSavedBanner(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          userId: user.id,
          full_name: fullName,
          email,
          organization_name: orgName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setOrganization(data.organization);
        setSavedBanner("Profile and organization settings updated.");
        await loadUserContext();
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite_member",
          full_name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteName("");
        setInviteEmail("");
        setMembers(data.members || []);
        setSavedBanner(`Invited ${inviteEmail} to ${orgName}.`);
      } else {
        alert(data.error || "Failed to invite team member.");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remove_member",
        userId: memberId,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMembers(data.members || []);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      <DashboardNav />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              User Profile &amp; Organization Team Panel
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Manage your personal developer profile, organization workspace
              settings, and team member RBAC roles.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {savedBanner && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{savedBanner}</span>
          </div>
        )}

        {loading && !user ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
            Loading user account...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: User Profile & Organization Settings */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-4 border-b border-zinc-800/80 pb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 font-mono text-base font-bold text-indigo-300">
                    {user?.avatar_initials || "AJ"}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">
                      {user?.full_name}
                    </div>
                    <div className="font-mono text-xs text-zinc-400">
                      {user?.email}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-300">
                      <Shield className="h-3 w-3" />
                      <span>{user?.role || "admin"}</span>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>
                      {savingProfile
                        ? "Saving Profile..."
                        : "Save Profile & Workspace"}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Organization Members & Invite Panel */}
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400" />
                    <h2 className="text-base font-bold text-white">
                      Organization Members ({members.length})
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">
                    Org Slug: {organization?.slug || "acme-fintech"}
                  </span>
                </div>

                {/* Members List */}
                <div className="mt-4 divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 font-mono text-xs font-bold text-zinc-200">
                          {member.avatar_initials ||
                            member.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {member.full_name}
                            </span>
                            {member.id === user?.id && (
                              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[10px] text-indigo-300">
                                You
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-zinc-400">
                            {member.email} • Joined{" "}
                            {formatRelativeDate(member.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase ${
                            member.role === "admin"
                              ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                              : "border-zinc-700 bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {member.role}
                        </span>

                        {members.length > 1 && member.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:border-rose-500/40 hover:text-rose-400"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Invite New Member Form */}
                <form
                  onSubmit={handleInviteMember}
                  className="mt-6 border-t border-zinc-800/80 pt-5"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    Invite Team Member to {organization?.name}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="engineer@company.dev"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as "admin" | "member")
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      {inviting ? "Inviting..." : "Add Member to Organization"}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
