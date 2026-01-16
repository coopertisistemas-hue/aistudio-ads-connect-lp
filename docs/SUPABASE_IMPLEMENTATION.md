# Supabase Schema & Edge Functions — ADS Connect Admin

**Objetivo:** Migrar todo o Admin Console de localStorage para Supabase com schema completo, RLS policies, e Edge Functions.

---

## 📋 Visão Geral

### Módulos a Migrar (18)
1. Creatives (Mídia)
2. Inventory (Sites)
3. Slots (Ad Spaces)
4. Clients
5. Plans
6. Subscriptions
7. Invoices
8. Contracts
9. Users
10. Roles & Permissions
11. Integrations
12. Audit Logs
13. Tickets (Support)
14. Marketing Channels
15. Insights (IA)
16. Leads (já existe)
17. Sites (já existe)
18. Ads (já existe)

---

## 🗄️ Database Schema

### 1. Creatives (Mídia)

```sql
-- Tabela de criativos
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

-- Índices
CREATE INDEX idx_creatives_type ON creatives(type);
CREATE INDEX idx_creatives_status ON creatives(status);
CREATE INDEX idx_creatives_tags ON creatives USING GIN(tags);

-- RLS
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all creatives"
    ON creatives FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert creatives"
    ON creatives FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update creatives"
    ON creatives FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete creatives"
    ON creatives FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');
```

### 2. Inventory & Slots

```sql
-- Tabela de inventário (sites)
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

-- Tabela de slots
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

-- Índices
CREATE INDEX idx_slots_site ON ad_slots(site_id);
CREATE INDEX idx_slots_position ON ad_slots(position);
CREATE INDEX idx_slots_type ON ad_slots(type);
CREATE INDEX idx_slots_status ON ad_slots(status);

-- RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory"
    ON inventory FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage slots"
    ON ad_slots FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');
```

### 3. Clients & Commercial

```sql
-- Tabela de clientes
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

-- Tabela de planos
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

-- Tabela de assinaturas
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

-- Tabela de faturas
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

-- Tabela de contratos
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

-- Índices
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_contracts_client ON contracts(client_id);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage clients" ON clients FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage plans" ON plans FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage contracts" ON contracts FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
```

### 4. System (Users, Roles, Audit)

```sql
-- Tabela de roles
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

-- Tabela de usuários admin
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

-- Tabela de audit logs
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

-- Tabela de integrações
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

-- Tabela de tickets (suporte)
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

-- Índices
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles" ON roles FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can view users" ON admin_users FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage integrations" ON integrations FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage tickets" ON tickets FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
```

### 5. Marketing & Analytics

```sql
-- Tabela de canais de marketing
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

-- Tabela de insights IA
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

-- RLS
ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketing" ON marketing_channels FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage insights" ON insights FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 🔧 Edge Functions

### 1. `calculate-subscription-mrr`

```typescript
// supabase/functions/calculate-subscription-mrr/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Calcular MRR de todas as assinaturas ativas
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('value, plan_id')
    .eq('status', 'active')

  const mrr = subscriptions?.reduce((sum, sub) => sum + sub.value, 0) || 0

  // Atualizar stats em cache ou retornar
  return new Response(JSON.stringify({ mrr }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 2. `process-invoice-payment`

```typescript
// supabase/functions/process-invoice-payment/index.ts
serve(async (req) => {
  const { invoice_id, payment_method } = await req.json()
  
  const supabase = createClient(...)

  // Atualizar invoice
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method
    })
    .eq('id', invoice_id)

  // Criar audit log
  await supabase.from('audit_logs').insert({
    action: 'update',
    entity_type: 'invoice',
    entity_id: invoice_id,
    changes: { status: 'paid' }
  })

  return new Response(JSON.stringify({ success: true }))
})
```

### 3. `sync-inventory-stats`

```typescript
// supabase/functions/sync-inventory-stats/index.ts
serve(async (req) => {
  const supabase = createClient(...)

  // Buscar todos os sites
  const { data: sites } = await supabase.from('inventory').select('site_id')

  for (const site of sites || []) {
    // Contar slots por site
    const { count: total } = await supabase
      .from('ad_slots')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', site.site_id)

    const { count: occupied } = await supabase
      .from('ad_slots')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', site.site_id)
      .not('current_ad_id', 'is', null)

    // Atualizar inventory
    await supabase
      .from('inventory')
      .update({
        total_slots: total || 0,
        occupied_slots: occupied || 0,
        available_slots: (total || 0) - (occupied || 0),
        last_sync_at: new Date().toISOString()
      })
      .eq('site_id', site.site_id)
  }

  return new Response(JSON.stringify({ synced: sites?.length || 0 }))
})
```

### 4. `generate-audit-report`

```typescript
// supabase/functions/generate-audit-report/index.ts
serve(async (req) => {
  const { start_date, end_date, entity_type } = await req.json()
  
  const supabase = createClient(...)

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', start_date)
    .lte('created_at', end_date)
    .eq('entity_type', entity_type)
    .order('created_at', { ascending: false })

  // Gerar CSV ou PDF
  const report = logs?.map(log => ({
    date: log.created_at,
    user: log.user_email,
    action: log.action,
    entity: log.entity_type
  }))

  return new Response(JSON.stringify({ report }))
})
```

---

## 📦 Storage Buckets

```sql
-- Bucket para criativos
INSERT INTO storage.buckets (id, name, public) VALUES ('creatives', 'creatives', true);

-- Bucket para contratos
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);

-- Bucket para avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- RLS para storage
CREATE POLICY "Admins can upload creatives"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creatives' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view creatives"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creatives');
```

---

## 🔄 Migration Strategy

### Fase 1: Setup Inicial
1. Criar todas as tabelas via migration
2. Configurar RLS policies
3. Deploy Edge Functions
4. Criar storage buckets

### Fase 2: Migração de Dados
1. Exportar dados de localStorage
2. Transformar para formato Supabase
3. Importar via batch inserts
4. Validar integridade

### Fase 3: Atualizar Services
1. Substituir `localStorage` por `supabase.from()`
2. Adicionar error handling
3. Implementar optimistic updates
4. Configurar Realtime subscriptions

### Fase 4: Testing
1. Testar CRUD operations
2. Validar RLS policies
3. Testar Edge Functions
4. Performance testing

---

## 📝 Próximos Passos

1. **Criar migration file** (`supabase/migrations/`)
2. **Implementar Edge Functions** (`supabase/functions/`)
3. **Atualizar services** (substituir localStorage)
4. **Configurar env vars** (SUPABASE_URL, SUPABASE_ANON_KEY)
5. **Deploy e teste**

---

**Status:** Pronto para implementação  
**Estimativa:** 4-6 horas para migração completa
