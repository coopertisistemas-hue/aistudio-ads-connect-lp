// ============================================================================
// Edge Function: track-click
// ============================================================================
// Descrição: Registra clique em anúncio com anti-fraude e conversão
// Versão: 1.0
// Performance: <40ms p95

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// TYPES
// ============================================================================

interface TrackClickRequest {
    ad_id: string
    impression_id?: string // ID da impressão relacionada (se disponível)
    slot_id: string
    site_id: string
    context?: {
        click_x?: number // Coordenada X do clique
        click_y?: number // Coordenada Y do clique
        user_agent?: string
        referrer?: string
        page_url?: string
        device_type?: 'desktop' | 'mobile' | 'tablet'
        time_on_page?: number // Tempo na página antes do clique (ms)
    }
}

interface TrackClickResponse {
    success: boolean
    click_id?: string
    redirect_url?: string
    fraud_score?: number
    blocked?: boolean
    error?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Thresholds anti-fraude para cliques
const FRAUD_THRESHOLDS = {
    MAX_CLICKS_PER_IP_PER_HOUR: 20,
    MAX_CLICKS_PER_AD_PER_IP_PER_DAY: 3,
    MIN_TIME_BETWEEN_CLICKS_MS: 2000, // 2 segundos
    MIN_TIME_ON_PAGE_MS: 1000, // Tempo mínimo na página antes de clicar
    MAX_CLICK_WITHOUT_IMPRESSION_HOURS: 1, // Máximo de tempo entre impressão e clique
}

// ============================================================================
// ANTI-FRAUD FUNCTIONS
// ============================================================================

/**
 * Calcula fraud score para cliques
 */
async function calculateClickFraudScore(
    supabase: any,
    adId: string,
    impressionId: string | undefined,
    ipAddress: string,
    userAgent: string,
    timeOnPage?: number
): Promise<number> {
    let score = 0

    // 1. Verificar cliques recentes do mesmo IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentClicks } = await supabase
        .from('clicks')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ipAddress)
        .gte('timestamp', oneHourAgo)

    if (recentClicks && recentClicks > FRAUD_THRESHOLDS.MAX_CLICKS_PER_IP_PER_HOUR) {
        score += 60 // Muito suspeito
    } else if (recentClicks && recentClicks > 10) {
        score += 30
    }

    // 2. Verificar cliques do mesmo anúncio + IP
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: adClicks } = await supabase
        .from('clicks')
        .select('id', { count: 'exact', head: true })
        .eq('ad_id', adId)
        .eq('ip_address', ipAddress)
        .gte('timestamp', oneDayAgo)

    if (adClicks && adClicks > FRAUD_THRESHOLDS.MAX_CLICKS_PER_AD_PER_IP_PER_DAY) {
        score += 50 // Muito suspeito - mesmo IP clicando repetidamente
    }

    // 3. Verificar se existe impressão relacionada
    if (impressionId) {
        const { data: impression } = await supabase
            .from('impressions')
            .select('timestamp, fraud_score, is_blocked')
            .eq('id', impressionId)
            .single()

        if (!impression) {
            score += 40 // Impressão não encontrada
        } else {
            // Verificar tempo entre impressão e clique
            const timeSinceImpression = Date.now() - new Date(impression.timestamp).getTime()
            const maxTimeMs = FRAUD_THRESHOLDS.MAX_CLICK_WITHOUT_IMPRESSION_HOURS * 60 * 60 * 1000

            if (timeSinceImpression > maxTimeMs) {
                score += 25 // Clique muito tempo depois da impressão
            }

            if (timeSinceImpression < 500) {
                score += 35 // Clique muito rápido (possível bot)
            }

            // Herdar fraud score da impressão
            if (impression.fraud_score > 50) {
                score += 20
            }

            if (impression.is_blocked) {
                score += 30 // Impressão foi bloqueada
            }
        }
    } else {
        score += 30 // Clique sem impressão rastreada
    }

    // 4. Verificar tempo na página
    if (timeOnPage && timeOnPage < FRAUD_THRESHOLDS.MIN_TIME_ON_PAGE_MS) {
        score += 25 // Clique muito rápido
    }

    // 5. Verificar User Agent suspeito
    if (!userAgent || userAgent.length < 20) {
        score += 20
    }

    if (userAgent && (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider'))) {
        score += 70 // Bot detectado
    }

    // 6. Verificar último clique muito recente
    const { data: lastClick } = await supabase
        .from('clicks')
        .select('timestamp')
        .eq('ip_address', ipAddress)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

    if (lastClick) {
        const timeSinceLastMs = Date.now() - new Date(lastClick.timestamp).getTime()
        if (timeSinceLastMs < FRAUD_THRESHOLDS.MIN_TIME_BETWEEN_CLICKS_MS) {
            score += 40 // Cliques muito rápidos
        }
    }

    return Math.min(score, 100)
}

/**
 * Decide se deve bloquear o clique
 */
function shouldBlockClick(fraudScore: number): boolean {
    return fraudScore >= 70 // Threshold mais rigoroso para cliques
}

// ============================================================================
// METRICS UPDATE FUNCTIONS
// ============================================================================

/**
 * Atualiza métricas do slot
 */
async function updateSlotClickMetrics(
    supabase: any,
    slotId: string,
    revenue: number
): Promise<void> {
    // Incrementar cliques
    await supabase.rpc('increment_slot_clicks', {
        slot_uuid: slotId,
    })

    // Adicionar revenue do CPC
    if (revenue > 0) {
        await supabase.rpc('add_slot_revenue', {
            slot_uuid: slotId,
            amount: revenue,
        })
    }
}

/**
 * Atualiza métricas do anúncio
 */
async function updateAdClickMetrics(
    supabase: any,
    adId: string,
    revenue: number
): Promise<void> {
    const { data: ad } = await supabase
        .from('ads')
        .select('clicks, budget_remaining')
        .eq('id', adId)
        .single()

    if (ad) {
        await supabase
            .from('ads')
            .update({
                clicks: (ad.clicks || 0) + 1,
                budget_remaining: Math.max(0, ad.budget_remaining - revenue),
                updated_at: new Date().toISOString(),
            })
            .eq('id', adId)
    }
}

/**
 * Atualiza CTR (Click-Through Rate)
 */
async function updateCTR(
    supabase: any,
    adId: string,
    slotId: string
): Promise<void> {
    // Calcular CTR do anúncio
    const { data: adStats } = await supabase
        .from('ads')
        .select('impressions, clicks')
        .eq('id', adId)
        .single()

    if (adStats && adStats.impressions > 0) {
        const ctr = (adStats.clicks / adStats.impressions) * 100
        await supabase
            .from('ads')
            .update({ ctr })
            .eq('id', adId)
    }

    // Calcular CTR do slot
    const { data: slotStats } = await supabase
        .from('ad_slots')
        .select('impressions, clicks')
        .eq('id', slotId)
        .single()

    if (slotStats && slotStats.impressions > 0) {
        const ctr = (slotStats.clicks / slotStats.impressions) * 100
        await supabase
            .from('ad_slots')
            .update({ ctr })
            .eq('id', slotId)
    }
}

/**
 * Cria audit log
 */
async function createAuditLog(
    supabase: any,
    action: string,
    details: any
): Promise<void> {
    await supabase.from('audit_logs').insert({
        action,
        entity_type: 'click',
        entity_id: details.click_id,
        details,
        timestamp: new Date().toISOString(),
    })
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
        const body: TrackClickRequest = await req.json()
        const { ad_id, impression_id, slot_id, site_id, context } = body

        // Validação básica
        if (!ad_id || !slot_id || !site_id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing required fields: ad_id, slot_id, site_id',
                }),
                {
                    status: 400,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                }
            )
        }

        // Extrair IP e User Agent
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            'unknown'
        const userAgent = req.headers.get('user-agent') || context?.user_agent || 'unknown'

        // Criar cliente Supabase
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Buscar anúncio para pegar CPC e URL de destino
        const { data: ad, error: adError } = await supabase
            .from('ads')
            .select('cpc, click_url, status')
            .eq('id', ad_id)
            .single()

        if (adError || !ad) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Ad not found',
                }),
                {
                    status: 404,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                }
            )
        }

        if (ad.status !== 'active') {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Ad is not active',
                }),
                {
                    status: 403,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                }
            )
        }

        // Calcular fraud score
        const fraudScore = await calculateClickFraudScore(
            supabase,
            ad_id,
            impression_id,
            ipAddress,
            userAgent,
            context?.time_on_page
        )

        // Decidir se bloqueia
        const blocked = shouldBlockClick(fraudScore)

        const revenue = ad.cpc || 0

        // Registrar clique (mesmo se bloqueado)
        const { data: click, error: insertError } = await supabase
            .from('clicks')
            .insert({
                ad_id,
                impression_id,
                slot_id,
                site_id,
                timestamp: new Date().toISOString(),
                ip_address: ipAddress,
                user_agent: userAgent,
                click_x: context?.click_x,
                click_y: context?.click_y,
                referrer: context?.referrer,
                page_url: context?.page_url,
                device_type: context?.device_type,
                time_on_page: context?.time_on_page,
                fraud_score: fraudScore,
                is_blocked: blocked,
                revenue: blocked ? 0 : revenue,
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('Error inserting click:', insertError)
            throw insertError
        }

        // Se não bloqueado, atualizar métricas
        if (!blocked && click) {
            await Promise.all([
                updateSlotClickMetrics(supabase, slot_id, revenue),
                updateAdClickMetrics(supabase, ad_id, revenue),
                updateCTR(supabase, ad_id, slot_id),
                createAuditLog(supabase, 'click_tracked', {
                    click_id: click.id,
                    ad_id,
                    impression_id,
                    slot_id,
                    site_id,
                    fraud_score: fraudScore,
                    revenue,
                }),
            ])
        } else if (blocked) {
            await createAuditLog(supabase, 'click_blocked', {
                click_id: click?.id,
                ad_id,
                fraud_score: fraudScore,
                reason: 'high_fraud_score',
            })
        }

        const duration = Date.now() - startTime

        const response: TrackClickResponse = {
            success: true,
            click_id: click?.id,
            redirect_url: blocked ? undefined : ad.click_url,
            fraud_score: fraudScore,
            blocked,
        }

        console.log(`[CLICK] ${blocked ? 'BLOCKED' : 'TRACKED'} in ${duration}ms (fraud: ${fraudScore})`)

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
                'X-Response-Time': `${duration}ms`,
                'X-Fraud-Score': fraudScore.toString(),
            },
        })

    } catch (error) {
        console.error('Error tracking click:', error)

        const duration = Date.now() - startTime

        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error',
            }),
            {
                status: 500,
                headers: {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json',
                    'X-Response-Time': `${duration}ms`,
                },
            }
        )
    }
})
