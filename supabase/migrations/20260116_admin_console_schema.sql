-- ADS Connect Admin Console - Complete Database Schema
-- Migration: 20260116_admin_console_schema
-- Description: Complete schema for all 18 admin modules

-- Note: Supabase uses gen_random_uuid() by default (pgcrypto extension)

-- ============================================================================
-- 1. CREATIVES (Mídia)
-- ============================================================================

CREATE TABLE creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'copy')),
    url TEXT,
    thumbnail_url TEXT,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    tags TEXT[] DEFAULT '{}',
    used_in_ads UUID[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creatives_type ON creatives(type);
CREATE INDEX idx_creatives_status ON creatives(status);
CREATE INDEX idx_creatives_tags ON creatives USING GIN(tags);

-- ============================================================================
-- 2. INVENTORY & SLOTS
-- ============================================================================

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT NOT NULL UNIQUE,
    site_name TEXT NOT NULL,
    total_slots INTEGER NOT NULL DEFAULT 0,
    occupied_slots INTEGER NOT NULL DEFAULT 0,
    available_slots INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    impressions BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT NOT NULL,
    site_name TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('header', 'sidebar', 'footer', 'inline', 'popup')),
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('banner', 'video', 'native', 'interstitial')),
    current_ad_id UUID,
    current_ad_name TEXT,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    ctr DECIMAL(5,2) NOT NULL DEFAULT 0,
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (site_id) REFERENCES inventory(site_id) ON DELETE CASCADE
);

CREATE INDEX idx_slots_site ON ad_slots(site_id);
CREATE INDEX idx_slots_position ON ad_slots(position);
CREATE INDEX idx_slots_type ON ad_slots(type);
CREATE INDEX idx_slots_status ON ad_slots(status);

-- ============================================================================
-- 3. CLIENTS & COMMERCIAL
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    cnpj TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address JSONB,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'prospect')),
    active_contracts INTEGER NOT NULL DEFAULT 0,
    active_subscriptions INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    lifetime_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tagline TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'semiannual', 'yearly')),
    features TEXT[] NOT NULL,
    limits JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    is_popular BOOLEAN NOT NULL DEFAULT false,
    active_subscriptions INTEGER NOT NULL DEFAULT 0,
    monthly_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended', 'pending', 'expired')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'boleto', 'pix', 'bank_transfer')),
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    issue_date TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    paid_date TIMESTAMPTZ,
    payment_method TEXT,
    items JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('service', 'partnership', 'nda', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
    signed_by_client BOOLEAN NOT NULL DEFAULT false,
    signed_by_company BOOLEAN NOT NULL DEFAULT false,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- ============================================================================
-- 4. SYSTEM (Users, Roles, Audit)
-- ============================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    users_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'export', 'import')),
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('api', 'webhook', 'oauth', 'custom')),
    provider TEXT,
    config JSONB NOT NULL,
    credentials JSONB,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    last_sync_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'feature_request', 'bug')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    resolution TEXT,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_client ON tickets(client_id);

-- ============================================================================
-- 5. MARKETING & ANALYTICS
-- ============================================================================

CREATE TABLE marketing_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('google', 'meta', 'linkedin', 'email', 'organic', 'direct', 'referral')),
    spend DECIMAL(10,2) NOT NULL DEFAULT 0,
    leads INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    roi DECIMAL(10,2) NOT NULL DEFAULT 0,
    cpl DECIMAL(10,2) NOT NULL DEFAULT 0,
    cpc DECIMAL(10,2) NOT NULL DEFAULT 0,
    ctr DECIMAL(5,2) NOT NULL DEFAULT 0,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('optimization', 'alert', 'prediction', 'recommendation')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data JSONB,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'applied')),
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketing_channel ON marketing_channels(channel);
CREATE INDEX idx_marketing_period ON marketing_channels(period_start, period_end);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_priority ON insights(priority);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Admin policies (full access for authenticated admins)
CREATE POLICY "Admins can manage creatives" ON creatives FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory" ON inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage slots" ON ad_slots FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage clients" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage plans" ON plans FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage contracts" ON contracts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON roles FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can view users" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage integrations" ON integrations FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage tickets" ON tickets FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage marketing" ON marketing_channels FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage insights" ON insights FOR ALL TO authenticated USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON creatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_slots_updated_at BEFORE UPDATE ON ad_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_channels_updated_at BEFORE UPDATE ON marketing_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Initial Roles)
-- ============================================================================

INSERT INTO roles (name, description, permissions, is_system) VALUES
('Super Admin', 'Acesso total ao sistema', '{
  "leads": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "sites": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "ads": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "creatives": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "inventory": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "clients": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "subscriptions": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true},
  "users": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": true}
}'::jsonb, true),
('Admin', 'Acesso administrativo limitado', '{
  "leads": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": false},
  "sites": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": false},
  "ads": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": false},
  "creatives": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": false},
  "inventory": {"canView": true, "canCreate": false, "canEdit": false, "canDelete": false},
  "clients": {"canView": true, "canCreate": true, "canEdit": true, "canDelete": false},
  "subscriptions": {"canView": true, "canCreate": false, "canEdit": false, "canDelete": false},
  "users": {"canView": true, "canCreate": false, "canEdit": false, "canDelete": false}
}'::jsonb, true);
