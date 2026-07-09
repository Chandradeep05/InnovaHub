-- InnovaHub Document Engine — Database Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension (already exists from initial setup)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces (top-level tenant: "InnovaHub", "CSI Society")
CREATE TABLE IF NOT EXISTS doc_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects (recurring events: "Hackathon 2026")
CREATE TABLE IF NOT EXISTS doc_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES doc_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Templates (reusable designs: "Certificate A4 Landscape")
CREATE TABLE IF NOT EXISTS doc_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES doc_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) DEFAULT 'certificate',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Template Versions (every layout edit = new version)
CREATE TABLE IF NOT EXISTS doc_template_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES doc_templates(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    layout_json JSONB NOT NULL,
    base_image_url TEXT NOT NULL,
    preview_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(template_id, version)
);

-- 5. Campaigns (one send event: template + CSV + recipients)
CREATE TABLE IF NOT EXISTS doc_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES doc_projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    template_id UUID REFERENCES doc_templates(id),
    template_version INTEGER,
    email_subject VARCHAR(300),
    email_body TEXT,
    doc_id_prefix VARCHAR(20) DEFAULT 'DOC',
    status VARCHAR(30) DEFAULT 'draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. Recipients (one row per person per campaign)
CREATE TABLE IF NOT EXISTS doc_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES doc_campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    merge_fields JSONB NOT NULL DEFAULT '{}',
    document_id VARCHAR(50),
    send_status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Email Logs (delivery tracking)
CREATE TABLE IF NOT EXISTS doc_email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES doc_recipients(id) ON DELETE CASCADE,
    provider VARCHAR(30) DEFAULT 'brevo',
    status VARCHAR(20),
    message_id VARCHAR(200),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_doc_projects_workspace ON doc_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_doc_campaigns_project ON doc_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_doc_recipients_campaign ON doc_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_doc_recipients_status ON doc_recipients(send_status);
CREATE INDEX IF NOT EXISTS idx_doc_template_versions_template ON doc_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_doc_email_logs_recipient ON doc_email_logs(recipient_id);
