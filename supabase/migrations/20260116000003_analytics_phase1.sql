-- ============================================================================
-- ANALYTICS INFRASTRUCTURE - PHASE 1
-- ============================================================================
-- Descrição: Tabelas de métricas, triggers de agregação e materialized views
-- Versão: 1.0
-- Data: 2026-01-16

-- ============================================================================
-- 1. TABELA: metrics_hourly
-- ============================================================================

CREATE TABLE IF NOT EXISTS metrics_hourly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dimensões
    hour TIMESTAMPTZ NOT NULL,
    site_id UUID REFERENCES partner_sites(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Métricas de Impressões
    impressions BIGINT DEFAULT 0,
    impressions_viewable BIGINT DEFAULT 0,
    impressions_blocked BIGINT DEFAULT 0,
    avg_viewability_time INTEGER DEFAULT 0, -- ms
    
    -- Métricas de Cliques
    clicks BIGINT DEFAULT 0,
    clicks_blocked BIGINT DEFAULT 0,
    conversions BIGINT DEFAULT 0,
    
    -- Métricas Calculadas
    ctr DECIMAL(5,2) DEFAULT 0, -- Click-Through Rate
    cvr DECIMAL(5,2) DEFAULT 0, -- Conversion Rate
    
    -- Revenue
    revenue_impressions DECIMAL(12,2) DEFAULT 0,
    revenue_clicks DECIMAL(12,2) DEFAULT 0,
    revenue_conversions DECIMAL(12,2) DEFAULT 0,
    revenue_total DECIMAL(12,2) DEFAULT 0,
    
    -- Anti-Fraude
    avg_fraud_score DECIMAL(5,2) DEFAULT 0,
    fraud_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(hour, site_id, ad_id, client_id)
);

-- Indexes para performance
CREATE INDEX idx_metrics_hourly_hour ON metrics_hourly(hour DESC);
CREATE INDEX idx_metrics_hourly_site ON metrics_hourly(site_id, hour DESC);
CREATE INDEX idx_metrics_hourly_ad ON metrics_hourly(ad_id, hour DESC);
CREATE INDEX idx_metrics_hourly_client ON metrics_hourly(client_id, hour DESC);
CREATE INDEX idx_metrics_hourly_composite ON metrics_hourly(site_id, ad_id, hour DESC);

COMMENT ON TABLE metrics_hourly IS 'Métricas agregadas por hora para dashboards em tempo real';

-- ============================================================================
-- 2. TABELA: metrics_daily
-- ============================================================================

CREATE TABLE IF NOT EXISTS metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dimensões
    date DATE NOT NULL,
    site_id UUID REFERENCES partner_sites(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Métricas
    impressions BIGINT DEFAULT 0,
    impressions_viewable BIGINT DEFAULT 0,
    impressions_blocked BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    clicks_blocked BIGINT DEFAULT 0,
    conversions BIGINT DEFAULT 0,
    
    -- Métricas Calculadas
    ctr DECIMAL(5,2) DEFAULT 0,
    cvr DECIMAL(5,2) DEFAULT 0,
    
    -- Revenue
    revenue_total DECIMAL(12,2) DEFAULT 0,
    
    -- Anti-Fraude
    avg_fraud_score DECIMAL(5,2) DEFAULT 0,
    fraud_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(date, site_id, ad_id, client_id)
);

-- Indexes
CREATE INDEX idx_metrics_daily_date ON metrics_daily(date DESC);
CREATE INDEX idx_metrics_daily_site ON metrics_daily(site_id, date DESC);
CREATE INDEX idx_metrics_daily_ad ON metrics_daily(ad_id, date DESC);
CREATE INDEX idx_metrics_daily_client ON metrics_daily(client_id, date DESC);

COMMENT ON TABLE metrics_daily IS 'Métricas agregadas por dia para análises históricas';

-- ============================================================================
-- 3. TABELA: metrics_monthly
-- ============================================================================

CREATE TABLE IF NOT EXISTS metrics_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dimensões
    month DATE NOT NULL, -- Primeiro dia do mês
    site_id UUID REFERENCES partner_sites(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Métricas
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    conversions BIGINT DEFAULT 0,
    revenue_total DECIMAL(12,2) DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(month, site_id, ad_id, client_id)
);

-- Indexes
CREATE INDEX idx_metrics_monthly_month ON metrics_monthly(month DESC);
CREATE INDEX idx_metrics_monthly_site ON metrics_monthly(site_id, month DESC);

COMMENT ON TABLE metrics_monthly IS 'Métricas agregadas por mês para relatórios executivos';

-- ============================================================================
-- 4. TRIGGER: Agregar Impressão
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_impression()
RETURNS TRIGGER AS $$
DECLARE
    metric_hour TIMESTAMPTZ;
    metric_date DATE;
    metric_month DATE;
    site_client_id UUID;
BEGIN
    -- Calcular períodos
    metric_hour := DATE_TRUNC('hour', NEW.timestamp);
    metric_date := DATE_TRUNC('day', NEW.timestamp)::DATE;
    metric_month := DATE_TRUNC('month', NEW.timestamp)::DATE;
    
    -- Buscar client_id do site
    SELECT client_id INTO site_client_id
    FROM partner_sites
    WHERE id = NEW.site_id;
    
    -- ========================================================================
    -- AGREGAR POR HORA
    -- ========================================================================
    INSERT INTO metrics_hourly (
        hour, site_id, ad_id, client_id,
        impressions, impressions_viewable, impressions_blocked,
        revenue_impressions, avg_fraud_score, avg_viewability_time
    ) VALUES (
        metric_hour,
        NEW.site_id,
        NEW.ad_id,
        site_client_id,
        1,
        CASE WHEN NEW.is_viewable THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        NEW.fraud_score,
        COALESCE(NEW.time_visible, 0)
    )
    ON CONFLICT (hour, site_id, ad_id, client_id)
    DO UPDATE SET
        impressions = metrics_hourly.impressions + 1,
        impressions_viewable = metrics_hourly.impressions_viewable + 
            CASE WHEN NEW.is_viewable THEN 1 ELSE 0 END,
        impressions_blocked = metrics_hourly.impressions_blocked + 
            CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        revenue_impressions = metrics_hourly.revenue_impressions + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        revenue_total = metrics_hourly.revenue_total + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        avg_fraud_score = (
            (metrics_hourly.avg_fraud_score * metrics_hourly.impressions + NEW.fraud_score) / 
            (metrics_hourly.impressions + 1)
        ),
        avg_viewability_time = (
            (metrics_hourly.avg_viewability_time * metrics_hourly.impressions_viewable + COALESCE(NEW.time_visible, 0)) / 
            NULLIF(metrics_hourly.impressions_viewable + CASE WHEN NEW.is_viewable THEN 1 ELSE 0 END, 0)
        ),
        fraud_rate = (
            (metrics_hourly.impressions_blocked + CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END)::DECIMAL / 
            (metrics_hourly.impressions + 1)
        ) * 100,
        updated_at = NOW();
    
    -- ========================================================================
    -- AGREGAR POR DIA
    -- ========================================================================
    INSERT INTO metrics_daily (
        date, site_id, ad_id, client_id,
        impressions, impressions_viewable, impressions_blocked,
        revenue_total, avg_fraud_score
    ) VALUES (
        metric_date,
        NEW.site_id,
        NEW.ad_id,
        site_client_id,
        1,
        CASE WHEN NEW.is_viewable THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        NEW.fraud_score
    )
    ON CONFLICT (date, site_id, ad_id, client_id)
    DO UPDATE SET
        impressions = metrics_daily.impressions + 1,
        impressions_viewable = metrics_daily.impressions_viewable + 
            CASE WHEN NEW.is_viewable THEN 1 ELSE 0 END,
        impressions_blocked = metrics_daily.impressions_blocked + 
            CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        revenue_total = metrics_daily.revenue_total + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        avg_fraud_score = (
            (metrics_daily.avg_fraud_score * metrics_daily.impressions + NEW.fraud_score) / 
            (metrics_daily.impressions + 1)
        ),
        fraud_rate = (
            (metrics_daily.impressions_blocked + CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END)::DECIMAL / 
            (metrics_daily.impressions + 1)
        ) * 100,
        updated_at = NOW();
    
    -- ========================================================================
    -- AGREGAR POR MÊS
    -- ========================================================================
    INSERT INTO metrics_monthly (
        month, site_id, ad_id, client_id,
        impressions, revenue_total
    ) VALUES (
        metric_month,
        NEW.site_id,
        NEW.ad_id,
        site_client_id,
        1,
        CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END
    )
    ON CONFLICT (month, site_id, ad_id, client_id)
    DO UPDATE SET
        impressions = metrics_monthly.impressions + 1,
        revenue_total = metrics_monthly.revenue_total + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_aggregate_impression
    AFTER INSERT ON impressions
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_impression();

COMMENT ON FUNCTION aggregate_impression IS 'Agrega impressões em métricas horárias, diárias e mensais';

-- ============================================================================
-- 5. TRIGGER: Agregar Clique
-- ============================================================================

CREATE OR REPLACE FUNCTION aggregate_click()
RETURNS TRIGGER AS $$
DECLARE
    metric_hour TIMESTAMPTZ;
    metric_date DATE;
    metric_month DATE;
    site_client_id UUID;
BEGIN
    metric_hour := DATE_TRUNC('hour', NEW.timestamp);
    metric_date := DATE_TRUNC('day', NEW.timestamp)::DATE;
    metric_month := DATE_TRUNC('month', NEW.timestamp)::DATE;
    
    SELECT client_id INTO site_client_id
    FROM partner_sites
    WHERE id = NEW.site_id;
    
    -- ========================================================================
    -- AGREGAR POR HORA
    -- ========================================================================
    INSERT INTO metrics_hourly (
        hour, site_id, ad_id, client_id,
        clicks, clicks_blocked, conversions,
        revenue_clicks, revenue_conversions
    ) VALUES (
        metric_hour,
        NEW.site_id,
        NEW.ad_id,
        site_client_id,
        1,
        CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        CASE WHEN NEW.converted THEN 1 ELSE 0 END,
        CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        COALESCE(NEW.conversion_value, 0)
    )
    ON CONFLICT (hour, site_id, ad_id, client_id)
    DO UPDATE SET
        clicks = metrics_hourly.clicks + 1,
        clicks_blocked = metrics_hourly.clicks_blocked + 
            CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        conversions = metrics_hourly.conversions + 
            CASE WHEN NEW.converted THEN 1 ELSE 0 END,
        revenue_clicks = metrics_hourly.revenue_clicks + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END,
        revenue_conversions = metrics_hourly.revenue_conversions + 
            COALESCE(NEW.conversion_value, 0),
        revenue_total = metrics_hourly.revenue_total + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END + 
            COALESCE(NEW.conversion_value, 0),
        ctr = CASE 
            WHEN metrics_hourly.impressions > 0 
            THEN ((metrics_hourly.clicks + 1)::DECIMAL / metrics_hourly.impressions) * 100
            ELSE 0
        END,
        cvr = CASE 
            WHEN metrics_hourly.clicks > 0 
            THEN ((metrics_hourly.conversions + CASE WHEN NEW.converted THEN 1 ELSE 0 END)::DECIMAL / (metrics_hourly.clicks + 1)) * 100
            ELSE 0
        END,
        updated_at = NOW();
    
    -- ========================================================================
    -- AGREGAR POR DIA
    -- ========================================================================
    INSERT INTO metrics_daily (
        date, site_id, ad_id, client_id,
        clicks, clicks_blocked, conversions,
        revenue_total
    ) VALUES (
        metric_date,
        NEW.site_id,
        NEW.ad_id,
        site_client_id,
        1,
        CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        CASE WHEN NEW.converted THEN 1 ELSE 0 END,
        CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END + COALESCE(NEW.conversion_value, 0)
    )
    ON CONFLICT (date, site_id, ad_id, client_id)
    DO UPDATE SET
        clicks = metrics_daily.clicks + 1,
        clicks_blocked = metrics_daily.clicks_blocked + 
            CASE WHEN NEW.is_blocked THEN 1 ELSE 0 END,
        conversions = metrics_daily.conversions + 
            CASE WHEN NEW.converted THEN 1 ELSE 0 END,
        revenue_total = metrics_daily.revenue_total + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END + 
            COALESCE(NEW.conversion_value, 0),
        ctr = CASE 
            WHEN metrics_daily.impressions > 0 
            THEN ((metrics_daily.clicks + 1)::DECIMAL / metrics_daily.impressions) * 100
            ELSE 0
        END,
        cvr = CASE 
            WHEN metrics_daily.clicks > 0 
            THEN ((metrics_daily.conversions + CASE WHEN NEW.converted THEN 1 ELSE 0 END)::DECIMAL / (metrics_daily.clicks + 1)) * 100
            ELSE 0
        END,
        updated_at = NOW();
    
    -- ========================================================================
    -- AGREGAR POR MÊS
    -- ========================================================================
    INSERT INTO metrics_monthly (
        month, site_id, ad_id, client_id,
        clicks, conversions, revenue_total
    ) VALUES (
        metric_month,
        NEW.site_id,
        NEW.ad_id,
        site_client_id,
        1,
        CASE WHEN NEW.converted THEN 1 ELSE 0 END,
        CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END + COALESCE(NEW.conversion_value, 0)
    )
    ON CONFLICT (month, site_id, ad_id, client_id)
    DO UPDATE SET
        clicks = metrics_monthly.clicks + 1,
        conversions = metrics_monthly.conversions + 
            CASE WHEN NEW.converted THEN 1 ELSE 0 END,
        revenue_total = metrics_monthly.revenue_total + 
            CASE WHEN NOT NEW.is_blocked THEN NEW.revenue ELSE 0 END + 
            COALESCE(NEW.conversion_value, 0),
        ctr = CASE 
            WHEN metrics_monthly.impressions > 0 
            THEN (metrics_monthly.clicks + 1)::DECIMAL / metrics_monthly.impressions * 100
            ELSE 0
        END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_aggregate_click
    AFTER INSERT ON clicks
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_click();

COMMENT ON FUNCTION aggregate_click IS 'Agrega cliques em métricas horárias, diárias e mensais';

-- ============================================================================
-- 6. MATERIALIZED VIEW: Dashboard Overview
-- ============================================================================

CREATE MATERIALIZED VIEW dashboard_overview AS
SELECT
    -- Métricas Globais (últimas 24h)
    COALESCE(SUM(impressions), 0) as total_impressions,
    COALESCE(SUM(clicks), 0) as total_clicks,
    ROUND(COALESCE(AVG(ctr), 0), 2) as avg_ctr,
    COALESCE(SUM(revenue_total), 0) as total_revenue,
    ROUND(COALESCE(AVG(avg_fraud_score), 0), 2) as avg_fraud_score,
    
    -- Contadores
    COUNT(DISTINCT site_id) as active_sites,
    COUNT(DISTINCT ad_id) as active_ads,
    
    -- Timestamp
    NOW() as last_updated
    
FROM metrics_hourly
WHERE hour > NOW() - INTERVAL '24 hours';

-- Index único para refresh
CREATE UNIQUE INDEX ON dashboard_overview ((true));

COMMENT ON MATERIALIZED VIEW dashboard_overview IS 'Overview global do dashboard (últimas 24h)';

-- ============================================================================
-- 7. MATERIALIZED VIEW: Site Metrics Summary
-- ============================================================================

CREATE MATERIALIZED VIEW site_metrics_summary AS
SELECT
    ps.id as site_id,
    ps.name as site_name,
    ps.domain,
    ps.status,
    
    -- Últimas 24h
    COALESCE(SUM(mh.impressions) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0) as impressions_24h,
    COALESCE(SUM(mh.clicks) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0) as clicks_24h,
    COALESCE(SUM(mh.revenue_total) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0) as revenue_24h,
    ROUND(COALESCE(AVG(mh.ctr) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0), 2) as ctr_24h,
    
    -- Últimos 7 dias
    COALESCE(SUM(md.impressions) FILTER (WHERE md.date > CURRENT_DATE - 7), 0) as impressions_7d,
    COALESCE(SUM(md.clicks) FILTER (WHERE md.date > CURRENT_DATE - 7), 0) as clicks_7d,
    COALESCE(SUM(md.revenue_total) FILTER (WHERE md.date > CURRENT_DATE - 7), 0) as revenue_7d,
    
    -- Últimos 30 dias
    COALESCE(SUM(md.impressions) FILTER (WHERE md.date > CURRENT_DATE - 30), 0) as impressions_30d,
    COALESCE(SUM(md.clicks) FILTER (WHERE md.date > CURRENT_DATE - 30), 0) as clicks_30d,
    COALESCE(SUM(md.revenue_total) FILTER (WHERE md.date > CURRENT_DATE - 30), 0) as revenue_30d,
    
    -- Timestamp
    NOW() as last_updated

FROM partner_sites ps
LEFT JOIN metrics_hourly mh ON mh.site_id = ps.id
LEFT JOIN metrics_daily md ON md.site_id = ps.id
WHERE ps.status = 'active'
GROUP BY ps.id, ps.name, ps.domain, ps.status;

CREATE UNIQUE INDEX ON site_metrics_summary (site_id);

COMMENT ON MATERIALIZED VIEW site_metrics_summary IS 'Resumo de métricas por site (24h, 7d, 30d)';

-- ============================================================================
-- 8. MATERIALIZED VIEW: Ad Metrics Summary
-- ============================================================================

CREATE MATERIALIZED VIEW ad_metrics_summary AS
SELECT
    a.id as ad_id,
    a.name as ad_name,
    a.type as ad_type,
    a.status,
    
    -- Últimas 24h
    COALESCE(SUM(mh.impressions) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0) as impressions_24h,
    COALESCE(SUM(mh.clicks) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0) as clicks_24h,
    COALESCE(SUM(mh.revenue_total) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0) as revenue_24h,
    ROUND(COALESCE(AVG(mh.ctr) FILTER (WHERE mh.hour > NOW() - INTERVAL '24 hours'), 0), 2) as ctr_24h,
    
    -- Últimos 7 dias
    COALESCE(SUM(md.impressions) FILTER (WHERE md.date > CURRENT_DATE - 7), 0) as impressions_7d,
    COALESCE(SUM(md.clicks) FILTER (WHERE md.date > CURRENT_DATE - 7), 0) as clicks_7d,
    COALESCE(SUM(md.revenue_total) FILTER (WHERE md.date > CURRENT_DATE - 7), 0) as revenue_7d,
    
    -- Timestamp
    NOW() as last_updated

FROM ads a
LEFT JOIN metrics_hourly mh ON mh.ad_id = a.id
LEFT JOIN metrics_daily md ON md.ad_id = a.id
WHERE a.status = 'active'
GROUP BY a.id, a.name, a.type, a.status;

CREATE UNIQUE INDEX ON ad_metrics_summary (ad_id);

COMMENT ON MATERIALIZED VIEW ad_metrics_summary IS 'Resumo de métricas por anúncio';

-- ============================================================================
-- 9. FUNCTION: Refresh Materialized Views
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_overview;
    REFRESH MATERIALIZED VIEW CONCURRENTLY site_metrics_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY ad_metrics_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_analytics_views IS 'Atualiza todas as materialized views de analytics';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
