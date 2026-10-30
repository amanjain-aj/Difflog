import fs from "fs";
import path from "path";
import crypto from "crypto";
import { INITIAL_SEED_DATA } from "@/lib/db/seed";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/db/supabase";
import {
  ChangelogEntry,
  Organization,
  PlanTier,
  Project,
  SpecSyncDatabaseSchema,
  StructuredChangeItem,
} from "@/lib/db/types";
import { generateProjectApiKey, hashApiKey } from "@/lib/crypto/api-keys";

const LOCAL_DB_DIR = path.join(process.cwd(), ".data");
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, "specsync-db.json");

function readLocalDb(): SpecSyncDatabaseSchema {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(
        LOCAL_DB_PATH,
        JSON.stringify(INITIAL_SEED_DATA, null, 2),
        "utf-8"
      );
      return structuredClone(INITIAL_SEED_DATA);
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw) as SpecSyncDatabaseSchema;
  } catch {
    return structuredClone(INITIAL_SEED_DATA);
  }
}

function writeLocalDb(data: SpecSyncDatabaseSchema): void {
  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getDefaultOrganization(): Promise<Organization> {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    if (!error && data) {
      return data as Organization;
    }
  }
  const db = readLocalDb();
  return db.organizations[0];
}

export async function updateOrganizationPlan(
  organizationId: string,
  planTier: PlanTier,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<Organization | null> {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const updates: Record<string, unknown> = {
      plan_tier: planTier,
      updated_at: new Date().toISOString(),
    };
    if (stripeCustomerId) updates.stripe_customer_id = stripeCustomerId;
    if (stripeSubscriptionId) updates.stripe_subscription_id = stripeSubscriptionId;

    const { data, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", organizationId)
      .select("*")
      .single();
    if (!error && data) return data as Organization;
  }

  const db = readLocalDb();
  const org = db.organizations.find((o) => o.id === organizationId);
  if (!org) return null;
  org.plan_tier = planTier;
  org.updated_at = new Date().toISOString();
  if (stripeCustomerId) org.stripe_customer_id = stripeCustomerId;
  if (stripeSubscriptionId) org.stripe_subscription_id = stripeSubscriptionId;
  writeLocalDb(db);
  return org;
}

export async function listProjects(): Promise<Project[]> {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data as Project[];
    }
  }
  const db = readLocalDb();
  return db.projects;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", normalizedSlug)
      .single();
    if (!error && data) {
      return data as Project;
    }
  }
  const db = readLocalDb();
  return (
    db.projects.find((p) => p.slug.toLowerCase() === normalizedSlug) || null
  );
}

export async function getProjectByApiKey(rawKey: string): Promise<{
  project: Project;
  organization: Organization;
} | null> {
  const keyHash = hashApiKey(rawKey);
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data: projectData, error: projErr } = await supabase
      .from("projects")
      .select("*")
      .eq("api_key_hash", keyHash)
      .single();
    if (!projErr && projectData) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", projectData.organization_id)
        .single();
      if (orgData) {
        return {
          project: projectData as Project,
          organization: orgData as Organization,
        };
      }
    }
  }

  const db = readLocalDb();
  const project = db.projects.find((p) => p.api_key_hash === keyHash);
  if (!project) return null;
  const organization =
    db.organizations.find((o) => o.id === project.organization_id) ||
    db.organizations[0];
  return { project, organization };
}

export async function createProject(input: {
  name: string;
  slug: string;
  custom_domain?: string | null;
  is_public?: boolean;
}): Promise<{ project: Project; rawApiKey: string }> {
  const org = await getDefaultOrganization();
  const { rawKey, keyHash, maskedPreview } = generateProjectApiKey();
  const slug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  const newProject: Project = {
    id: crypto.randomUUID(),
    organization_id: org.id,
    name: input.name.trim(),
    slug,
    api_key_hash: keyHash,
    api_key_preview: maskedPreview,
    is_public: input.is_public ?? true,
    custom_domain: input.custom_domain || null,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        id: newProject.id,
        organization_id: newProject.organization_id,
        name: newProject.name,
        slug: newProject.slug,
        api_key_hash: newProject.api_key_hash,
        is_public: newProject.is_public,
        custom_domain: newProject.custom_domain,
      })
      .select("*")
      .single();
    if (!error && data) {
      return {
        project: { ...(data as Project), api_key_preview: maskedPreview },
        rawApiKey: rawKey,
      };
    }
  }

  const db = readLocalDb();
  if (db.projects.some((p) => p.slug === slug)) {
    throw new Error(`Project with slug "${slug}" already exists.`);
  }
  db.projects.unshift(newProject);
  writeLocalDb(db);
  return { project: newProject, rawApiKey: rawKey };
}

export async function rotateProjectApiKey(
  projectId: string
): Promise<{ project: Project; rawApiKey: string } | null> {
  const { rawKey, keyHash, maskedPreview } = generateProjectApiKey();
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .update({ api_key_hash: keyHash })
      .eq("id", projectId)
      .select("*")
      .single();
    if (!error && data) {
      return {
        project: { ...(data as Project), api_key_preview: maskedPreview },
        rawApiKey: rawKey,
      };
    }
  }

  const db = readLocalDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;
  project.api_key_hash = keyHash;
  project.api_key_preview = maskedPreview;
  writeLocalDb(db);
  return { project, rawApiKey: rawKey };
}

export async function listChangelogEntries(
  projectId: string,
  options?: { publishedOnly?: boolean }
): Promise<ChangelogEntry[]> {
  const publishedOnly = options?.publishedOnly ?? false;
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    let query = supabase
      .from("changelog_entries")
      .select("*")
      .eq("project_id", projectId)
      .order("published_at", { ascending: false });

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }
    const { data, error } = await query;
    if (!error && data) {
      return data as ChangelogEntry[];
    }
  }

  const db = readLocalDb();
  return db.changelog_entries
    .filter(
      (entry) =>
        entry.project_id === projectId &&
        (!publishedOnly || entry.is_published)
    )
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
}

export async function createChangelogEntry(input: {
  project_id: string;
  commit_hash: string;
  commit_message?: string | null;
  title: string;
  summary: string;
  has_breaking_changes: boolean;
  raw_diff: Record<string, unknown>;
  structured_changes: StructuredChangeItem[];
  version_tag?: string | null;
  is_published?: boolean;
}): Promise<ChangelogEntry> {
  const entry: ChangelogEntry = {
    id: crypto.randomUUID(),
    project_id: input.project_id,
    commit_hash: input.commit_hash,
    commit_message: input.commit_message || null,
    title: input.title,
    summary: input.summary,
    has_breaking_changes: input.has_breaking_changes,
    raw_diff: input.raw_diff,
    structured_changes: input.structured_changes,
    published_at: new Date().toISOString(),
    is_published: input.is_published ?? true,
    version_tag: input.version_tag || null,
  };

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("changelog_entries")
      .insert(entry)
      .select("*")
      .single();
    if (!error && data) {
      return data as ChangelogEntry;
    }
  }

  const db = readLocalDb();
  db.changelog_entries.unshift(entry);
  writeLocalDb(db);
  return entry;
}

export async function updateChangelogEntry(
  entryId: string,
  updates: Partial<
    Pick<
      ChangelogEntry,
      "title" | "summary" | "is_published" | "version_tag" | "has_breaking_changes"
    >
  >
): Promise<ChangelogEntry | null> {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("changelog_entries")
      .update(updates)
      .eq("id", entryId)
      .select("*")
      .single();
    if (!error && data) {
      return data as ChangelogEntry;
    }
  }

  const db = readLocalDb();
  const entry = db.changelog_entries.find((e) => e.id === entryId);
  if (!entry) return null;
  if (updates.title !== undefined) entry.title = updates.title;
  if (updates.summary !== undefined) entry.summary = updates.summary;
  if (updates.is_published !== undefined)
    entry.is_published = updates.is_published;
  if (updates.version_tag !== undefined)
    entry.version_tag = updates.version_tag;
  if (updates.has_breaking_changes !== undefined)
    entry.has_breaking_changes = updates.has_breaking_changes;
  writeLocalDb(db);
  return entry;
}

export async function deleteChangelogEntry(entryId: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { error } = await supabase
      .from("changelog_entries")
      .delete()
      .eq("id", entryId);
    if (!error) return true;
  }

  const db = readLocalDb();
  const prevLen = db.changelog_entries.length;
  db.changelog_entries = db.changelog_entries.filter((e) => e.id !== entryId);
  if (db.changelog_entries.length !== prevLen) {
    writeLocalDb(db);
    return true;
  }
  return false;
}

export function getStorageMode(): "supabase" | "local-json" {
  return isSupabaseConfigured() ? "supabase" : "local-json";
}
