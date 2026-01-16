-- ============================================================================
-- PARTNER SITES (ATIVOS REAIS) — Complete Schema
-- ============================================================================
-- Descrição: Schema completo para sites parceiros que exibem anúncios
-- Versão: 1.0
-- Data: 2026-01-16

-- ============================================================================
-- 1. TABELA PRINCIPAL: partner_sites
-- ============================================================================

CREATE TABLE partner_sites (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
    name TEXT NOT NULL,
    description TEXT,
    
    -- Domínio e URLs
    domain TEXT NOT NULL UNIQUE,
    homepage_url TEXT NOT NULL,
    logo_url TEXT,
    favicon_url TEXT,
    
    -- Categorização
    category TEXT NOT NULL CHECK (category IN (
        'news', 'blog', 'ecommerce', 'entertainment', 
        'education', 'technology', 'sports', 'finance',
        'health', 'lifestyle', 'other'
    )),
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Localização e Idioma
    country TEXT NOT NULL DEFAULT 'BR',
    region TEXT, -- Estado/Província
    city TEXT,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    primary_language TEXT NOT NULL DEFAULT 'pt-BR',
    supported_languages TEXT[] DEFAULT ARRAY['pt-BR'],
    
    -- Tipo e Características
    site_type TEXT NOT NULL CHECK (site_type IN (
        'blog', 'news_portal', 'ecommerce', 'corporate',
        'community', 'forum', 'video_platform', 'other'
    )),
    platform TEXT, -- WordPress, Shopify, Custom, etc.
    monthly_pageviews BIGINT DEFAULT 0,
    monthly_unique_visitors BIGINT DEFAULT 0,
    average_session_duration INTEGER, -- segundos
    bounce_rate DECIMAL(5,2), -- percentual
    
    -- Status Comercial
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Aguardando aprovação
        'active',       -- Ativo e monetizando
        'paused',       -- Pausado temporariamente
        'suspended',    -- Suspenso por violação
        'inactive',     -- Inativo (sem anúncios)
        'archived'      -- Arquivado
    )),
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN (
        'pending', 'approved', 'rejected', 'under_review'
    )),
    rejection_reason TEXT,
    
    -- Relacionamento Comercial
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    revenue_share_percentage DECIMAL(5,2) NOT NULL DEFAULT 70.00, -- % para o parceiro
    minimum_cpm DECIMAL(10,2) DEFAULT 0.50, -- CPM mínimo aceito
    
    -- Configurações Técnicas
    api_key_hash TEXT UNIQUE,
    webhook_url TEXT,
    allowed_ad_types TEXT[] DEFAULT ARRAY['banner', 'video', 'native'],
    blocked_categories TEXT[] DEFAULT '{}', -- Categorias de anúncios bloqueadas
    max_ads_per_page INTEGER DEFAULT 5,
    
    -- Métricas de Performance (cache)
    total_impressions BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_ctr DECIMAL(5,2) DEFAULT 0,
    average_viewability DECIMAL(5,2) DEFAULT 0,
    fill_rate DECIMAL(5,2) DEFAULT 0, -- % de slots preenchidos
    
    -- Qualidade e Compliance
    quality_score INTEGER DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
    brand_safety_score INTEGER DEFAULT 0 CHECK (brand_safety_score BETWEEN 0 AND 100),
    has_adult_content BOOLEAN DEFAULT false,
    has_sensitive_content BOOLEAN DEFAULT false,
    is_mobile_friendly BOOLEAN DEFAULT true,
    ssl_enabled BOOLEAN DEFAULT true,
    
    -- Integração e Tracking
    google_analytics_id TEXT,
    google_tag_manager_id TEXT,
    facebook_pixel_id TEXT,
    custom_tracking_code TEXT,
    
    -- Contato e Suporte
    owner_name TEXT,
    owner_email TEXT,
    technical_contact_email TEXT,
    billing_contact_email TEXT,
    support_phone TEXT,
    
    -- Metadata
    notes TEXT,
    internal_notes TEXT, -- Notas privadas (não visíveis ao parceiro)
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_revenue_share CHECK (revenue_share_percentage BETWEEN 0 AND 100),
    CONSTRAINT valid_email CHECK (owner_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- ============================================================================
-- 2. TABELA: site_verification
-- ============================================================================
-- Para verificar propriedade do domínio

CREATE TABLE site_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES partner_sites(id) ON DELETE CASCADE,
    
    verification_method TEXT NOT NULL CHECK (verification_method IN (
        'dns_txt',      -- TXT record no DNS
        'meta_tag',     -- Meta tag no HTML
        'html_file',    -- Arquivo HTML na raiz
        'analytics'     -- Google Analytics
    )),
    
    verification_token TEXT NOT NULL UNIQUE,
    verification_code TEXT, -- Código que deve ser inserido
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'verified', 'failed', 'expired'
    )),
    
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    last_check_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(site_id, verification_method)
);

-- ============================================================================
-- 3. TABELA: site_performance_snapshots
-- ============================================================================
-- Snapshots diários de performance para histórico

CREATE TABLE site_performance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES partner_sites(id) ON DELETE CASCADE,
    
    snapshot_date DATE NOT NULL,
    
    -- Métricas do dia
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    viewability DECIMAL(5,2) DEFAULT 0,
    fill_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Tráfego
    pageviews BIGINT DEFAULT 0,
    unique_visitors BIGINT DEFAULT 0,
    sessions BIGINT DEFAULT 0,
    
    -- Qualidade
    invalid_traffic_rate DECIMAL(5,2) DEFAULT 0,
    bot_traffic_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(site_id, snapshot_date)
);

-- ============================================================================
-- 4. TABELA: site_payment_history
-- ============================================================================
-- Histórico de pagamentos aos parceiros

CREATE TABLE site_payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES partner_sites(id) ON DELETE CASCADE,
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    total_impressions BIGINT NOT NULL,
    total_clicks BIGINT NOT NULL,
    gross_revenue DECIMAL(12,2) NOT NULL,
    revenue_share_percentage DECIMAL(5,2) NOT NULL,
    partner_revenue DECIMAL(12,2) NOT NULL, -- Valor a pagar ao parceiro
    platform_revenue DECIMAL(12,2) NOT NULL, -- Valor retido pela plataforma
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'paid', 'failed', 'cancelled'
    )),
    
    payment_method TEXT CHECK (payment_method IN (
        'bank_transfer', 'pix', 'paypal', 'stripe', 'manual'
    )),
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. ATUALIZAR TABELA: inventory
-- ============================================================================
-- Adicionar foreign key para partner_sites

ALTER TABLE inventory 
    ADD COLUMN partner_site_id UUID REFERENCES partner_sites(id) ON DELETE CASCADE;

-- Criar índice
CREATE INDEX idx_inventory_partner_site ON inventory(partner_site_id);

-- ============================================================================
-- 6. ATUALIZAR TABELA: ad_slots
-- ============================================================================
-- Adicionar foreign key para partner_sites

ALTER TABLE ad_slots
    ADD COLUMN partner_site_id UUID REFERENCES partner_sites(id) ON DELETE CASCADE;

-- Criar índice
CREATE INDEX idx_ad_slots_partner_site ON ad_slots(partner_site_id);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índices principais
CREATE INDEX idx_partner_sites_domain ON partner_sites(domain);
CREATE INDEX idx_partner_sites_slug ON partner_sites(slug);
CREATE INDEX idx_partner_sites_status ON partner_sites(status);
CREATE INDEX idx_partner_sites_approval_status ON partner_sites(approval_status);
CREATE INDEX idx_partner_sites_category ON partner_sites(category);
CREATE INDEX idx_partner_sites_client ON partner_sites(client_id);
CREATE INDEX idx_partner_sites_country ON partner_sites(country);
CREATE INDEX idx_partner_sites_quality_score ON partner_sites(quality_score DESC);
CREATE INDEX idx_partner_sites_created_at ON partner_sites(created_at DESC);

-- Índices compostos
CREATE INDEX idx_partner_sites_status_approval ON partner_sites(status, approval_status);
CREATE INDEX idx_partner_sites_active_quality ON partner_sites(status, quality_score DESC) 
    WHERE status = 'active';

-- Índices para performance snapshots
CREATE INDEX idx_snapshots_site_date ON site_performance_snapshots(site_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_date ON site_performance_snapshots(snapshot_date DESC);

-- Índices para payment history
CREATE INDEX idx_payments_site ON site_payment_history(site_id);
CREATE INDEX idx_payments_status ON site_payment_history(status);
CREATE INDEX idx_payments_period ON site_payment_history(period_start, period_end);

-- Índices para verification
CREATE INDEX idx_verification_site ON site_verification(site_id);
CREATE INDEX idx_verification_status ON site_verification(status);

-- Índices GIN para arrays
CREATE INDEX idx_partner_sites_tags ON partner_sites USING GIN(tags);
CREATE INDEX idx_partner_sites_languages ON partner_sites USING GIN(supported_languages);
CREATE INDEX idx_partner_sites_ad_types ON partner_sites USING GIN(allowed_ad_types);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_partner_sites_updated_at 
    BEFORE UPDATE ON partner_sites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_verification_updated_at 
    BEFORE UPDATE ON site_verification 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_payment_history_updated_at 
    BEFORE UPDATE ON site_payment_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Nota: O trigger para atualizar last_active_at está na migration 20260116_tracking_tables.sql
-- pois depende da tabela impressions

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular revenue do parceiro
CREATE OR REPLACE FUNCTION calculate_partner_revenue(
    p_site_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    gross_revenue DECIMAL(12,2),
    partner_revenue DECIMAL(12,2),
    platform_revenue DECIMAL(12,2)
) AS $$
DECLARE
    v_revenue_share DECIMAL(5,2);
    v_gross DECIMAL(12,2);
BEGIN
    -- Buscar revenue share do site
    SELECT revenue_share_percentage INTO v_revenue_share
    FROM partner_sites
    WHERE id = p_site_id;
    
    -- Calcular revenue bruto do período
    SELECT COALESCE(SUM(s.revenue), 0) INTO v_gross
    FROM ad_slots s
    WHERE s.partner_site_id = p_site_id
    AND s.created_at BETWEEN p_start_date AND p_end_date;
    
    -- Retornar cálculos
    RETURN QUERY SELECT
        v_gross,
        ROUND(v_gross * (v_revenue_share / 100), 2),
        ROUND(v_gross * ((100 - v_revenue_share) / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar métricas do site (cache)
CREATE OR REPLACE FUNCTION refresh_site_metrics(p_site_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE partner_sites
    SET
        total_impressions = (
            SELECT COALESCE(SUM(impressions), 0)
            FROM ad_slots
            WHERE partner_site_id = p_site_id
        ),
        total_clicks = (
            SELECT COALESCE(SUM(clicks), 0)
            FROM ad_slots
            WHERE partner_site_id = p_site_id
        ),
        total_revenue = (
            SELECT COALESCE(SUM(revenue), 0)
            FROM ad_slots
            WHERE partner_site_id = p_site_id
        ),
        average_ctr = (
            SELECT COALESCE(AVG(ctr), 0)
            FROM ad_slots
            WHERE partner_site_id = p_site_id
        ),
        fill_rate = (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (COUNT(*) FILTER (WHERE current_ad_id IS NOT NULL)::DECIMAL / COUNT(*)) * 100
            END
            FROM ad_slots
            WHERE partner_site_id = p_site_id
        ),
        last_sync_at = NOW()
    WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE partner_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_payment_history ENABLE ROW LEVEL SECURITY;

-- Policies para admins (acesso total)
CREATE POLICY "Admins can manage partner sites"
    ON partner_sites FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage site verification"
    ON site_verification FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Admins can view performance snapshots"
    ON site_performance_snapshots FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage payment history"
    ON site_payment_history FOR ALL
    TO authenticated
    USING (true);

-- Policies para parceiros (acesso limitado aos próprios dados)
-- Nota: Requer implementação de auth.jwt() com role de parceiro

CREATE POLICY "Partners can view own site"
    ON partner_sites FOR SELECT
    TO authenticated
    USING (
        client_id = (auth.jwt() ->> 'client_id')::UUID
    );

CREATE POLICY "Partners can view own performance"
    ON site_performance_snapshots FOR SELECT
    TO authenticated
    USING (
        site_id IN (
            SELECT id FROM partner_sites 
            WHERE client_id = (auth.jwt() ->> 'client_id')::UUID
        )
    );

CREATE POLICY "Partners can view own payments"
    ON site_payment_history FOR SELECT
    TO authenticated
    USING (
        site_id IN (
            SELECT id FROM partner_sites 
            WHERE client_id = (auth.jwt() ->> 'client_id')::UUID
        )
    );

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View de sites ativos com métricas
CREATE VIEW active_partner_sites AS
SELECT 
    ps.*,
    COUNT(DISTINCT s.id) as total_slots,
    COUNT(DISTINCT s.id) FILTER (WHERE s.current_ad_id IS NOT NULL) as occupied_slots,
    COALESCE(SUM(s.impressions), 0) as total_impressions_realtime,
    COALESCE(SUM(s.clicks), 0) as total_clicks_realtime
FROM partner_sites ps
LEFT JOIN ad_slots s ON s.partner_site_id = ps.id
WHERE ps.status = 'active' AND ps.approval_status = 'approved'
GROUP BY ps.id;

-- View de performance mensal
CREATE VIEW monthly_site_performance AS
SELECT 
    ps.id as site_id,
    ps.name as site_name,
    DATE_TRUNC('month', sps.snapshot_date) as month,
    SUM(sps.impressions) as total_impressions,
    SUM(sps.clicks) as total_clicks,
    SUM(sps.revenue) as total_revenue,
    AVG(sps.ctr) as avg_ctr,
    AVG(sps.viewability) as avg_viewability,
    AVG(sps.fill_rate) as avg_fill_rate
FROM partner_sites ps
JOIN site_performance_snapshots sps ON sps.site_id = ps.id
GROUP BY ps.id, ps.name, DATE_TRUNC('month', sps.snapshot_date);

-- ============================================================================
-- SEED DATA (Exemplo)
-- ============================================================================

-- Inserir site de exemplo
INSERT INTO partner_sites (
    slug, name, domain, homepage_url, category, site_type,
    country, primary_language, status, approval_status,
    revenue_share_percentage, monthly_pageviews
) VALUES (
    'exemplo-blog',
    'Exemplo Blog de Tecnologia',
    'exemplo.com.br',
    'https://exemplo.com.br',
    'technology',
    'blog',
    'BR',
    'pt-BR',
    'active',
    'approved',
    70.00,
    50000
);

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE partner_sites IS 'Sites parceiros que exibem anúncios da plataforma';
COMMENT ON TABLE site_verification IS 'Verificação de propriedade de domínio';
COMMENT ON TABLE site_performance_snapshots IS 'Snapshots diários de performance';
COMMENT ON TABLE site_payment_history IS 'Histórico de pagamentos aos parceiros';

COMMENT ON COLUMN partner_sites.quality_score IS 'Score de qualidade (0-100) baseado em métricas';
COMMENT ON COLUMN partner_sites.brand_safety_score IS 'Score de brand safety (0-100)';
COMMENT ON COLUMN partner_sites.revenue_share_percentage IS 'Percentual de revenue que vai para o parceiro';
COMMENT ON COLUMN partner_sites.fill_rate IS 'Percentual de slots preenchidos com anúncios';
