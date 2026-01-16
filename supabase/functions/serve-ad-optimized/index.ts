// ============================================================================
// Edge Function: serve-ad-optimized
// ============================================================================
// Descrição: Serve anúncio otimizado com cache e registro de impressão
// Versão: 1.0
// Performance: <50ms p95

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// TYPES
// ============================================================================

interface ServeAdRequest {
    site_id: string
    slot_position: 'header' | 'sidebar' | 'footer' | 'inline' | 'popup'
    user_context?: {
        device?: 'desktop' | 'mobile' | 'tablet'
        location?: string
        user_agent?: string
        referrer?: string
    }
}

interface ServeAdResponse {
    success: boolean
    ad?: {
        id: string
        type: 'banner' | 'video' | 'native'
        creative: {
            url: string
            thumbnail_url?: string
            width: number
            height: number
        }
        click_url: string
        impression_tracking_url: string
    }
    cache_ttl?: number
    error?: string
}

interface Ad {
    id: string
    name: string
    type: string
    status: string
    creative_id: string
    click_url: string
    cpm: number
    cpc: number
    budget_remaining: number
    targeting: any
    start_date: string
    end_date: string | null
    creatives: {
        url: string
        thumbnail_url: string
        width: number
        height: number
        type: string
    }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const CACHE_TTL = {
    AD_SELECTION: 300,      // 5 minutos
    NO_AD_AVAILABLE: 60,    // 1 minuto
    ERROR: 10,              // 10 segundos
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valida API key do site
 */
async function validateSiteKey(
    supabase: any,
    siteId: string,
    apiKey: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from('partner_sites')
        .select('id, status, approval_status')
        .eq('id', siteId)
        .eq('api_key_hash', apiKey)
        .single()

    if (error || !data) return false

    return data.status === 'active' && data.approval_status === 'approved'
}

/**
 * Busca slot disponível para a posição
 */
async function findAvailableSlot(
    supabase: any,
    siteId: string,
    position: string
): Promise<any> {
    const { data, error } = await supabase
        .from('ad_slots')
        .select('id, width, height, type, current_ad_id')
        .eq('partner_site_id', siteId)
        .eq('position', position)
        .eq('status', 'active')
        .limit(1)
        .single()

    if (error) {
        console.error('Error finding slot:', error)
        return null
    }

    return data
}

/**
 * Seleciona melhor anúncio baseado em targeting e bid
 */
async function selectBestAd(
    supabase: any,
    slot: any,
    userContext: any
): Promise<Ad | null> {
    const now = new Date().toISOString()

    // Buscar ads elegíveis
    let query = supabase
        .from('ads')
        .select(`
      id, name, type, status, creative_id, click_url, cpm, cpc,
      budget_remaining, targeting, start_date, end_date,
      creatives (url, thumbnail_url, width, height, type)
    `)
        .eq('status', 'active')
        .gt('budget_remaining', 0)
        .lte('start_date', now)

    // Filtrar por end_date se existir
    query = query.or(`end_date.is.null,end_date.gte.${now}`)

    const { data: eligibleAds, error } = await query

    if (error || !eligibleAds || eligibleAds.length === 0) {
        console.log('No eligible ads found')
        return null
    }

    // Aplicar targeting
    const targetedAds = eligibleAds.filter((ad: Ad) => {
        // Device targeting
        if (ad.targeting?.devices && userContext?.device) {
            if (!ad.targeting.devices.includes(userContext.device)) {
                return false
            }
        }

        // Location targeting
        if (ad.targeting?.locations && userContext?.location) {
            if (!ad.targeting.locations.includes(userContext.location)) {
                return false
            }
        }

        // Size compatibility
        if (ad.creatives.width > slot.width || ad.creatives.height > slot.height) {
            return false
        }

        return true
    })

    if (targetedAds.length === 0) {
        console.log('No ads passed targeting')
        return null
    }

    // Ordenar por CPM (maior primeiro) e selecionar
    targetedAds.sort((a: Ad, b: Ad) => b.cpm - a.cpm)

    return targetedAds[0]
}

/**
 * Atualiza slot com anúncio selecionado
 */
async function updateSlotWithAd(
    supabase: any,
    slotId: string,
    adId: string
): Promise<void> {
    await supabase
        .from('ad_slots')
        .update({
            current_ad_id: adId,
            updated_at: new Date().toISOString()
        })
        .eq('id', slotId)
}

/**
 * Registra impressão (async, não bloqueia response)
 */
async function trackImpression(
    supabase: any,
    adId: string,
    slotId: string,
    siteId: string,
    userContext: any
): Promise<void> {
    try {
        // Inserir impressão
        await supabase.from('impressions').insert({
            ad_id: adId,
            slot_id: slotId,
            site_id: siteId,
            timestamp: new Date().toISOString(),
            viewport_width: userContext?.viewport_width,
            viewport_height: userContext?.viewport_height,
            user_agent: userContext?.user_agent,
            referrer: userContext?.referrer,
            is_viewable: false // Será atualizado depois
        })

        // Incrementar contador (usando RPC para performance)
        await supabase.rpc('increment_slot_impressions', {
            slot_uuid: slotId
        })

        // Calcular revenue (CPM)
        const { data: ad } = await supabase
            .from('ads')
            .select('cpm')
            .eq('id', adId)
            .single()

        if (ad) {
            const revenue = ad.cpm / 1000 // Revenue por impressão
            await supabase.rpc('add_slot_revenue', {
                slot_uuid: slotId,
                amount: revenue
            })
        }
    } catch (error) {
        console.error('Error tracking impression:', error)
        // Não propagar erro - impressão é best-effort
    }
}

/**
 * Gera cache key
 */
function getCacheKey(siteId: string, position: string, device?: string): string {
    return `ad:${siteId}:${position}:${device || 'any'}`
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS })
    }

    const startTime = Date.now()

    try {
        // Parse request
        const body: ServeAdRequest = await req.json()
        const { site_id, slot_position, user_context } = body

        // Validação básica
        if (!site_id || !slot_position) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing required fields: site_id, slot_position'
                }),
                {
                    status: 400,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                }
            )
        }

        // Validar API key
        const apiKey = req.headers.get('X-Site-Key')
        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing X-Site-Key header'
                }),
                {
                    status: 401,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                }
            )
        }

        // Criar cliente Supabase
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Validar site
        const isValidSite = await validateSiteKey(supabase, site_id, apiKey)
        if (!isValidSite) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid site or API key'
                }),
                {
                    status: 403,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
                }
            )
        }

        // Buscar slot
        const slot = await findAvailableSlot(supabase, site_id, slot_position)
        if (!slot) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No available slot for this position'
                }),
                {
                    status: 404,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                        'Cache-Control': `public, max-age=${CACHE_TTL.NO_AD_AVAILABLE}`
                    }
                }
            )
        }

        // Se slot já tem anúncio ativo, retornar (cache hit)
        if (slot.current_ad_id) {
            const { data: cachedAd } = await supabase
                .from('ads')
                .select(`
          id, type, click_url,
          creatives (url, thumbnail_url, width, height)
        `)
                .eq('id', slot.current_ad_id)
                .single()

            if (cachedAd) {
                // Registrar impressão (async)
                trackImpression(supabase, cachedAd.id, slot.id, site_id, user_context)

                const response: ServeAdResponse = {
                    success: true,
                    ad: {
                        id: cachedAd.id,
                        type: cachedAd.type as 'banner' | 'video' | 'native',
                        creative: cachedAd.creatives,
                        click_url: cachedAd.click_url,
                        impression_tracking_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-impression`
                    },
                    cache_ttl: CACHE_TTL.AD_SELECTION
                }

                const duration = Date.now() - startTime
                console.log(`[CACHE HIT] Served ad in ${duration}ms`)

                return new Response(JSON.stringify(response), {
                    status: 200,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                        'Cache-Control': `public, max-age=${CACHE_TTL.AD_SELECTION}`,
                        'X-Response-Time': `${duration}ms`
                    }
                })
            }
        }

        // Selecionar melhor anúncio
        const selectedAd = await selectBestAd(supabase, slot, user_context)

        if (!selectedAd) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No suitable ad found'
                }),
                {
                    status: 204,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                        'Cache-Control': `public, max-age=${CACHE_TTL.NO_AD_AVAILABLE}`
                    }
                }
            )
        }

        // Atualizar slot
        await updateSlotWithAd(supabase, slot.id, selectedAd.id)

        // Registrar impressão (async)
        trackImpression(supabase, selectedAd.id, slot.id, site_id, user_context)

        // Preparar response
        const response: ServeAdResponse = {
            success: true,
            ad: {
                id: selectedAd.id,
                type: selectedAd.type as 'banner' | 'video' | 'native',
                creative: selectedAd.creatives,
                click_url: selectedAd.click_url,
                impression_tracking_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-impression`
            },
            cache_ttl: CACHE_TTL.AD_SELECTION
        }

        const duration = Date.now() - startTime
        console.log(`[NEW AD] Served ad ${selectedAd.id} in ${duration}ms`)

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
                'Cache-Control': `public, max-age=${CACHE_TTL.AD_SELECTION}`,
                'X-Response-Time': `${duration}ms`,
                'X-Ad-Id': selectedAd.id
            }
        })

    } catch (error) {
        console.error('Error serving ad:', error)

        const duration = Date.now() - startTime

        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error'
            }),
            {
                status: 500,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                    'Cache-Control': `public, max-age=${CACHE_TTL.ERROR}`,
                    'X-Response-Time': `${duration}ms`
                }
            }
        )
    }
})
