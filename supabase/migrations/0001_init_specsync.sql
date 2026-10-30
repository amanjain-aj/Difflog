-- ============================================================================
-- SpecSync (APIChangelog.io) — PostgreSQL / Supabase DDL Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan_tier VARCHAR(50) DEFAULT 'starter', -- 'starter', 'growth', 'scale'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users in Supabase
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Projects (One org can have multiple API projects)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT true,
    custom_domain VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (organization_id, slug)
);

-- 4. Changelog Entries
CREATE TABLE IF NOT EXISTS changelog_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    commit_hash VARCHAR(64) NOT NULL,
    commit_message TEXT,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    has_breaking_changes BOOLEAN DEFAULT false,
    raw_diff JSONB NOT NULL,
    structured_changes JSONB NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true,
    version_tag VARCHAR(50)
);

-- Indexes for lightning-fast public rendering
CREATE INDEX IF NOT EXISTS idx_entries_project_published
    ON changelog_entries(project_id, published_at DESC)
    WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_projects_slug
    ON projects(slug);

-- ============================================================================
-- Row-Level Security (RLS) Policies for Supabase
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

-- Public read access for public projects and their published changelog entries
CREATE POLICY "Public projects are viewable by everyone"
    ON projects FOR SELECT
    USING (is_public = true);

CREATE POLICY "Published changelog entries are viewable by everyone"
    ON changelog_entries FOR SELECT
    USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = changelog_entries.project_id
            AND projects.is_public = true
        )
    );

-- Organization members can manage their own organization's resources
CREATE POLICY "Org members can view their organizations"
    ON organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can manage their projects"
    ON projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = projects.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can manage their changelog entries"
    ON changelog_entries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            JOIN organization_members ON organization_members.organization_id = projects.organization_id
            WHERE projects.id = changelog_entries.project_id
            AND organization_members.user_id = auth.uid()
        )
    );
