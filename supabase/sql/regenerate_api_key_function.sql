-- ============================================================================
-- RPC Function: Regenerar API Key de Site Parceiro
-- ============================================================================

CREATE OR REPLACE FUNCTION regenerate_site_api_key(site_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_api_key TEXT;
BEGIN
    -- Gerar nova API key
    new_api_key := encode(gen_random_bytes(32), 'hex');
    
    -- Atualizar site
    UPDATE partner_sites
    SET 
        api_key_hash = new_api_key,
        updated_at = NOW()
    WHERE id = site_uuid;
    
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
        site_uuid::TEXT,
        jsonb_build_object(
            'action', 'api_key_regenerated',
            'timestamp', NOW()
        ),
        NOW()
    );
    
    RETURN new_api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION regenerate_site_api_key IS 'Regenera API key de um site parceiro e registra no audit log';
