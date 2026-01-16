-- ============================================================================
-- API Key Management para Sites Parceiros
-- ============================================================================
-- Descrição: Scripts SQL para gerar e gerenciar API keys de sites parceiros
-- Uso: Executar no Supabase Dashboard > SQL Editor

-- ============================================================================
-- 1. GERAR API KEY PARA SITE PARCEIRO
-- ============================================================================

-- Gerar API key para um site específico
-- Substitua 'uuid-do-site' pelo ID real do site parceiro

UPDATE partner_sites
SET 
    api_key_hash = encode(gen_random_bytes(32), 'hex'),
    updated_at = NOW()
WHERE id = 'uuid-do-site';

-- Retornar a API key gerada
SELECT 
    id,
    name,
    domain,
    api_key_hash as api_key,
    status,
    approval_status
FROM partner_sites
WHERE id = 'uuid-do-site';

-- ============================================================================
-- 2. GERAR API KEYS PARA TODOS OS SITES ATIVOS
-- ============================================================================

-- Gerar API keys para todos os sites que não têm
UPDATE partner_sites
SET 
    api_key_hash = encode(gen_random_bytes(32), 'hex'),
    updated_at = NOW()
WHERE 
    api_key_hash IS NULL
    AND status = 'active'
    AND approval_status = 'approved';

-- Verificar sites atualizados
SELECT 
    id,
    name,
    domain,
    api_key_hash as api_key,
    status
FROM partner_sites
WHERE 
    status = 'active'
    AND approval_status = 'approved'
ORDER BY name;

-- ============================================================================
-- 3. REGENERAR API KEY (Rotação de Segurança)
-- ============================================================================

-- Regenerar API key de um site (ex: após comprometimento)
UPDATE partner_sites
SET 
    api_key_hash = encode(gen_random_bytes(32), 'hex'),
    updated_at = NOW()
WHERE id = 'uuid-do-site';

-- Registrar no audit log
INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    details,
    created_at
) VALUES (
    'update',
    'partner_site',
    'uuid-do-site',
    jsonb_build_object(
        'action', 'api_key_regenerated',
        'reason', 'security_rotation'
    ),
    NOW()
);

-- ============================================================================
-- 4. REVOGAR API KEY (Suspender Acesso)
-- ============================================================================

-- Revogar API key removendo-a
UPDATE partner_sites
SET 
    api_key_hash = NULL,
    status = 'suspended',
    updated_at = NOW()
WHERE id = 'uuid-do-site';

-- ============================================================================
-- 5. LISTAR TODOS OS SITES COM API KEYS
-- ============================================================================

SELECT 
    id,
    name,
    domain,
    api_key_hash as api_key,
    status,
    approval_status,
    created_at,
    updated_at,
    CASE 
        WHEN api_key_hash IS NOT NULL THEN '✅ Configurada'
        ELSE '❌ Faltando'
    END as api_key_status
FROM partner_sites
ORDER BY 
    CASE 
        WHEN api_key_hash IS NULL THEN 0
        ELSE 1
    END,
    name;

-- ============================================================================
-- 6. CRIAR SITE PARCEIRO COM API KEY
-- ============================================================================

-- Inserir novo site parceiro com API key gerada automaticamente
INSERT INTO partner_sites (
    slug,
    name,
    domain,
    homepage_url,
    category,
    site_type,
    country,
    primary_language,
    status,
    approval_status,
    revenue_share_percentage,
    api_key_hash,
    owner_email
) VALUES (
    'exemplo-blog-tech',
    'Exemplo Blog de Tecnologia',
    'exemplo-tech.com.br',
    'https://exemplo-tech.com.br',
    'technology',
    'blog',
    'BR',
    'pt-BR',
    'active',
    'approved',
    70.00,
    encode(gen_random_bytes(32), 'hex'), -- API key gerada automaticamente
    'contato@exemplo-tech.com.br'
)
RETURNING 
    id,
    name,
    domain,
    api_key_hash as api_key,
    status;

-- ============================================================================
-- 7. VALIDAR API KEY (Teste)
-- ============================================================================

-- Verificar se uma API key é válida
SELECT 
    id,
    name,
    domain,
    status,
    approval_status,
    CASE 
        WHEN status = 'active' AND approval_status = 'approved' THEN '✅ Válida'
        WHEN status != 'active' THEN '❌ Site inativo'
        WHEN approval_status != 'approved' THEN '❌ Site não aprovado'
        ELSE '❌ Inválida'
    END as validation_status
FROM partner_sites
WHERE api_key_hash = 'sua-api-key-aqui';

-- ============================================================================
-- 8. ESTATÍSTICAS DE API KEYS
-- ============================================================================

SELECT 
    COUNT(*) as total_sites,
    COUNT(*) FILTER (WHERE api_key_hash IS NOT NULL) as sites_with_api_key,
    COUNT(*) FILTER (WHERE api_key_hash IS NULL) as sites_without_api_key,
    COUNT(*) FILTER (WHERE status = 'active' AND approval_status = 'approved') as active_approved,
    ROUND(
        (COUNT(*) FILTER (WHERE api_key_hash IS NOT NULL)::DECIMAL / COUNT(*)) * 100,
        2
    ) as api_key_coverage_percent
FROM partner_sites;

-- ============================================================================
-- 9. FUNCTION: Gerar API Key Automaticamente ao Criar Site
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_api_key_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não foi fornecida API key, gerar automaticamente
    IF NEW.api_key_hash IS NULL THEN
        NEW.api_key_hash = encode(gen_random_bytes(32), 'hex');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_generate_api_key
    BEFORE INSERT ON partner_sites
    FOR EACH ROW
    EXECUTE FUNCTION generate_api_key_on_insert();

-- ============================================================================
-- 10. EXEMPLO DE USO COMPLETO
-- ============================================================================

-- Passo 1: Criar site parceiro (API key gerada automaticamente pelo trigger)
INSERT INTO partner_sites (
    slug, name, domain, homepage_url, category, site_type,
    country, primary_language, status, approval_status,
    revenue_share_percentage, owner_email
) VALUES (
    'meu-site',
    'Meu Site Parceiro',
    'meusite.com.br',
    'https://meusite.com.br',
    'blog',
    'blog',
    'BR',
    'pt-BR',
    'active',
    'approved',
    70.00,
    'contato@meusite.com.br'
)
RETURNING 
    id,
    name,
    api_key_hash as api_key;

-- Passo 2: Copiar o ID e API key retornados

-- Passo 3: Configurar no site parceiro (integration-example.html)
-- const CONFIG = {
--     siteId: 'id-retornado-acima',
--     apiKey: 'api-key-retornada-acima',
--     supabaseUrl: 'https://hwugnqevkeymqoahnwfb.supabase.co',
-- };

-- ============================================================================
-- NOTAS DE SEGURANÇA
-- ============================================================================

-- ⚠️ IMPORTANTE:
-- 1. API keys são sensíveis - nunca compartilhe publicamente
-- 2. Armazene em variáveis de ambiente no servidor
-- 3. Rotacione periodicamente (a cada 90 dias recomendado)
-- 4. Revogue imediatamente se comprometida
-- 5. Use HTTPS sempre para comunicação
-- 6. Monitore uso suspeito via audit_logs

-- ============================================================================
-- MONITORAMENTO DE USO
-- ============================================================================

-- Verificar últimas impressões por site
SELECT 
    ps.name as site_name,
    ps.domain,
    COUNT(i.id) as total_impressions,
    COUNT(i.id) FILTER (WHERE i.is_blocked = true) as blocked_impressions,
    MAX(i.timestamp) as last_impression
FROM partner_sites ps
LEFT JOIN impressions i ON i.site_id = ps.id
WHERE ps.status = 'active'
GROUP BY ps.id, ps.name, ps.domain
ORDER BY total_impressions DESC;

-- Detectar uso suspeito de API key
SELECT 
    ps.name,
    ps.domain,
    COUNT(i.id) as impressions_last_hour,
    COUNT(DISTINCT i.ip_address) as unique_ips,
    ROUND(AVG(i.fraud_score), 2) as avg_fraud_score
FROM partner_sites ps
JOIN impressions i ON i.site_id = ps.id
WHERE i.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ps.id, ps.name, ps.domain
HAVING COUNT(i.id) > 1000 OR AVG(i.fraud_score) > 50
ORDER BY impressions_last_hour DESC;
