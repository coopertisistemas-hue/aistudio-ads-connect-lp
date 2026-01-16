-- ============================================================================
-- Migration: Tracking Tables (Impressions & Clicks)
-- ============================================================================
-- Descrição: Tabelas para rastreamento de impressões e cliques com anti-fraude
-- Versão: 1.0
-- Data: 2026-01-16

-- ============================================================================
-- IMPRESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES partner_sites(id) ON DELETE CASCADE,
    
    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- User Context
    ip_address VARCHAR(45) NOT NULL, -- IPv4 ou IPv6
    user_agent TEXT,
    viewport_width INTEGER,
    viewport_height INTEGER,
    referrer TEXT,
    page_url TEXT,
    device_type VARCHAR(20), -- desktop, mobile, tablet
    
    -- Viewability
    is_viewable BOOLEAN DEFAULT FALSE,
    time_visible INTEGER, -- Tempo em ms que ficou visível
    
    -- Anti-Fraud
    fraud_score INTEGER DEFAULT 0 CHECK (fraud_score >= 0 AND fraud_score <= 100),
    is_blocked BOOLEAN DEFAULT FALSE,
    
    -- Revenue
    revenue DECIMAL(10, 4) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_impressions_ad_id ON impressions(ad_id);
CREATE INDEX idx_impressions_slot_id ON impressions(slot_id);
CREATE INDEX idx_impressions_site_id ON impressions(site_id);
CREATE INDEX idx_impressions_timestamp ON impressions(timestamp DESC);
CREATE INDEX idx_impressions_ip_address ON impressions(ip_address);
CREATE INDEX idx_impressions_fraud_score ON impressions(fraud_score) WHERE fraud_score > 50;
CREATE INDEX idx_impressions_blocked ON impressions(is_blocked) WHERE is_blocked = TRUE;

-- Index composto para queries anti-fraude
CREATE INDEX idx_impressions_fraud_check ON impressions(ip_address, timestamp DESC);
CREATE INDEX idx_impressions_ad_fraud_check ON impressions(ad_id, ip_address, timestamp DESC);

-- ============================================================================
-- CLICKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    impression_id UUID REFERENCES impressions(id) ON DELETE SET NULL,
    slot_id UUID NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES partner_sites(id) ON DELETE CASCADE,
    
    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- User Context
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    device_type VARCHAR(20),
    
    -- Click Details
    click_x INTEGER, -- Coordenada X do clique
    click_y INTEGER, -- Coordenada Y do clique
    time_on_page INTEGER, -- Tempo na página antes do clique (ms)
    
    -- Anti-Fraud
    fraud_score INTEGER DEFAULT 0 CHECK (fraud_score >= 0 AND fraud_score <= 100),
    is_blocked BOOLEAN DEFAULT FALSE,
    
    -- Revenue
    revenue DECIMAL(10, 4) DEFAULT 0,
    
    -- Conversion Tracking
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10, 2),
    conversion_timestamp TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_clicks_ad_id ON clicks(ad_id);
CREATE INDEX idx_clicks_impression_id ON clicks(impression_id);
CREATE INDEX idx_clicks_slot_id ON clicks(slot_id);
CREATE INDEX idx_clicks_site_id ON clicks(site_id);
CREATE INDEX idx_clicks_timestamp ON clicks(timestamp DESC);
CREATE INDEX idx_clicks_ip_address ON clicks(ip_address);
CREATE INDEX idx_clicks_fraud_score ON clicks(fraud_score) WHERE fraud_score > 50;
CREATE INDEX idx_clicks_blocked ON clicks(is_blocked) WHERE is_blocked = TRUE;
CREATE INDEX idx_clicks_converted ON clicks(converted) WHERE converted = TRUE;

-- Index composto para queries anti-fraude
CREATE INDEX idx_clicks_fraud_check ON clicks(ip_address, timestamp DESC);
CREATE INDEX idx_clicks_ad_fraud_check ON clicks(ad_id, ip_address, timestamp DESC);

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Incrementar impressões do slot
CREATE OR REPLACE FUNCTION increment_slot_impressions(slot_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ad_slots
    SET 
        impressions = COALESCE(impressions, 0) + 1,
        updated_at = NOW()
    WHERE id = slot_uuid;
END;
$$ LANGUAGE plpgsql;

-- Incrementar cliques do slot
CREATE OR REPLACE FUNCTION increment_slot_clicks(slot_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ad_slots
    SET 
        clicks = COALESCE(clicks, 0) + 1,
        updated_at = NOW()
    WHERE id = slot_uuid;
END;
$$ LANGUAGE plpgsql;

-- Adicionar revenue ao slot
CREATE OR REPLACE FUNCTION add_slot_revenue(slot_uuid UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE ad_slots
    SET 
        revenue = COALESCE(revenue, 0) + amount,
        updated_at = NOW()
    WHERE id = slot_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View de impressões válidas (não bloqueadas)
CREATE OR REPLACE VIEW valid_impressions AS
SELECT *
FROM impressions
WHERE is_blocked = FALSE;

-- View de cliques válidos (não bloqueados)
CREATE OR REPLACE VIEW valid_clicks AS
SELECT *
FROM clicks
WHERE is_blocked = FALSE;

-- View de estatísticas de fraude por anúncio
CREATE OR REPLACE VIEW ad_fraud_stats AS
SELECT 
    ad_id,
    COUNT(*) as total_impressions,
    COUNT(*) FILTER (WHERE is_blocked = TRUE) as blocked_impressions,
    ROUND(AVG(fraud_score), 2) as avg_fraud_score,
    ROUND(
        (COUNT(*) FILTER (WHERE is_blocked = TRUE)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as block_rate_percent
FROM impressions
GROUP BY ad_id;

-- View de CTR por anúncio
CREATE OR REPLACE VIEW ad_ctr_stats AS
SELECT 
    a.id as ad_id,
    a.name as ad_name,
    COUNT(DISTINCT i.id) as impressions,
    COUNT(DISTINCT c.id) as clicks,
    CASE 
        WHEN COUNT(DISTINCT i.id) > 0 
        THEN ROUND((COUNT(DISTINCT c.id)::DECIMAL / COUNT(DISTINCT i.id)) * 100, 2)
        ELSE 0
    END as ctr_percent
FROM ads a
LEFT JOIN valid_impressions i ON a.id = i.ad_id
LEFT JOIN valid_clicks c ON a.id = c.ad_id
GROUP BY a.id, a.name;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Admins podem ver tudo
CREATE POLICY "Admins can view all impressions"
    ON impressions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN roles r ON au.role_id = r.id
            WHERE au.id = auth.uid()
            AND r.name IN ('Super Admin', 'Admin')
        )
    );

CREATE POLICY "Admins can view all clicks"
    ON clicks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN roles r ON au.role_id = r.id
            WHERE au.id = auth.uid()
            AND r.name IN ('Super Admin', 'Admin')
        )
    );

-- Service role pode inserir (usado pelas Edge Functions)
CREATE POLICY "Service role can insert impressions"
    ON impressions FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can insert clicks"
    ON clicks FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE impressions IS 'Rastreamento de impressões de anúncios com anti-fraude';
COMMENT ON TABLE clicks IS 'Rastreamento de cliques em anúncios com anti-fraude e conversão';
COMMENT ON COLUMN impressions.fraud_score IS 'Score de fraude (0-100), calculado pela Edge Function';
COMMENT ON COLUMN clicks.fraud_score IS 'Score de fraude (0-100), calculado pela Edge Function';
COMMENT ON COLUMN impressions.is_viewable IS 'Se o anúncio estava visível no viewport';
COMMENT ON COLUMN clicks.time_on_page IS 'Tempo em ms que o usuário ficou na página antes de clicar';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar last_active_at do partner_site quando houver impressão
CREATE OR REPLACE FUNCTION update_site_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partner_sites
    SET last_active_at = NOW()
    WHERE id = (
        SELECT partner_site_id 
        FROM ad_slots 
        WHERE id = NEW.slot_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_site_last_active
    AFTER INSERT ON impressions
    FOR EACH ROW
    EXECUTE FUNCTION update_site_last_active();
