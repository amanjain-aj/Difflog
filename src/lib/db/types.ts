export type PlanTier = "starter" | "growth" | "scale";

export type ChangeTag = "BREAKING" | "NEW" | "CHANGED" | "DEPRECATED";

export interface StructuredChangeItem {
  tag: ChangeTag;
  endpoint: string;
  description: string;
}

export interface StructuredChangelogOutput {
  title: string;
  summary: string;
  has_breaking_changes: boolean;
  items: StructuredChangeItem[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_tier: PlanTier;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "admin" | "member";
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  api_key_hash: string;
  api_key_preview?: string;
  is_public: boolean;
  custom_domain: string | null;
  created_at: string;
}

export interface ChangelogEntry {
  id: string;
  project_id: string;
  commit_hash: string;
  commit_message: string | null;
  title: string;
  summary: string;
  has_breaking_changes: boolean;
  raw_diff: Record<string, unknown>;
  structured_changes: StructuredChangeItem[];
  published_at: string;
  is_published: boolean;
  version_tag: string | null;
}

export interface SpecSyncDatabaseSchema {
  organizations: Organization[];
  organization_members: OrganizationMember[];
  projects: Project[];
  changelog_entries: ChangelogEntry[];
}
