// ============================================================================
// Edge Function: track-impression
// ============================================================================
// Descrição: Registra impressão de anúncio com anti-fraude e métricas
// Versão: 1.0
// Performance: <30ms p95

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// TYPES
// ============================================================================

interface TrackImpressionRequest {
    ad_id: string
    slot_id: string
    site_id: string
    context?: {
        viewport_width?: number
        viewport_height?: number
        user_agent?: string
        referrer?: string
        page_url?: string
        device_type?: 'desktop' | 'mobile' | 'tablet'
        is_viewable?: boolean // Se o anúncio estava visível no viewport
        time_visible?: number // Tempo em ms que ficou visível
    }
}

interface TrackImpressionResponse {
    success: boolean
    impression_id?: string
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

// Thresholds anti-fraude
const FRAUD_THRESHOLDS = {
    MAX_IMPRESSIONS_PER_IP_PER_HOUR: 100,
    MAX_IMPRESSIONS_PER_AD_PER_IP_PER_DAY: 10,
    MIN_TIME_BETWEEN_IMPRESSIONS_MS: 1000, // 1 segundo
    MIN_VIEWABLE_TIME_MS: 500, // Tempo mínimo visível para contar
}

// ============================================================================
// ANTI-FRAUD FUNCTIONS
// ============================================================================

/**
 * Calcula fraud score baseado em padrões suspeitos
 */
async function calculateFraudScore(
    supabase: any,
    adId: string,
    siteId: string,
    ipAddress: string,
    userAgent: string
): Promise<number> {
    let score = 0

    // 1. Verificar impressões recentes do mesmo IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentImpressions } = await supabase
        .from('impressions')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ipAddress)
        .gte('timestamp', oneHourAgo)

    if (recentImpressions && recentImpressions > FRAUD_THRESHOLDS.MAX_IMPRESSIONS_PER_IP_PER_HOUR) {
        score += 50 // Muito suspeito
    } else if (recentImpressions && recentImpressions > 50) {
        score += 25 // Moderadamente suspeito
    }

    // 2. Verificar impressões do mesmo anúncio + IP
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: adImpressions } = await supabase
        .from('impressions')
        .select('id', { count: 'exact', head: true })
        .eq('ad_id', adId)
        .eq('ip_address', ipAddress)
        .gte('timestamp', oneDayAgo)

    if (adImpressions && adImpressions > FRAUD_THRESHOLDS.MAX_IMPRESSIONS_PER_AD_PER_IP_PER_DAY) {
        score += 40
    }

    // 3. Verificar User Agent suspeito
    if (!userAgent || userAgent.length < 20) {
        score += 20 // User agent muito curto ou ausente
    }

    if (userAgent && (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider'))) {
        score += 60 // Bot detectado
    }

    // 4. Verificar última impressão muito recente
    const { data: lastImpression } = await supabase
        .from('impressions')
        .select('timestamp')
        .eq('ip_address', ipAddress)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

    if (lastImpression) {
        const timeSinceLastMs = Date.now() - new Date(lastImpression.timestamp).getTime()
        if (timeSinceLastMs < FRAUD_THRESHOLDS.MIN_TIME_BETWEEN_IMPRESSIONS_MS) {
            score += 30 // Impressões muito rápidas
        }
    }

    return Math.min(score, 100) // Cap em 100
}

/**
 * Decide se deve bloquear baseado no fraud score
 */
function shouldBlock(fraudScore: number, isViewable: boolean, timeVisible?: number): boolean {
    // Bloquear se fraud score muito alto
    if (fraudScore >= 80) return true

    // Bloquear se não foi viewable
    if (!isViewable) return true

    // Bloquear se tempo visível muito baixo
    if (timeVisible && timeVisible < FRAUD_THRESHOLDS.MIN_VIEWABLE_TIME_MS) return true

    return false
}

// ============================================================================
// METRICS UPDATE FUNCTIONS
// ============================================================================

/**
 * Atualiza métricas agregadas do slot
 */
async function updateSlotMetrics(
    supabase: any,
    slotId: string,
    adId: string,
    revenue: number
): Promise<void> {
    // Incrementar impressões
    await supabase.rpc('increment_slot_impressions', {
        slot_uuid: slotId,
    })

    // Adicionar revenue
    if (revenue > 0) {
        await supabase.rpc('add_slot_revenue', {
            slot_uuid: slotId,
            amount: revenue,
        })
    }

    // Atualizar last_served
    await supabase
        .from('ad_slots')
        .update({
            last_served: new Date().toISOString(),
            current_ad_id: adId,
        })
        .eq('id', slotId)
}

/**
 * Atualiza métricas do anúncio
 */
async function updateAdMetrics(
    supabase: any,
    adId: string,
    revenue: number
): Promise<void> {
    const { data: ad } = await supabase
        .from('ads')
        .select('impressions, budget_remaining')
        .eq('id', adId)
        .single()

    if (ad) {
        await supabase
            .from('ads')
            .update({
                impressions: (ad.impressions || 0) + 1,
                budget_remaining: Math.max(0, ad.budget_remaining - revenue),
                updated_at: new Date().toISOString(),
            })
            .eq('id', adId)
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
        entity_type: 'impression',
        entity_id: details.impression_id,
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
        const body: TrackImpressionRequest = await req.json()
        const { ad_id, slot_id, site_id, context } = body

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

        // Calcular fraud score
        const fraudScore = await calculateFraudScore(
            supabase,
            ad_id,
            site_id,
            ipAddress,
            userAgent
        )

        // Decidir se bloqueia
        const blocked = shouldBlock(
            fraudScore,
            context?.is_viewable ?? false,
            context?.time_visible
        )

        // Buscar CPM do anúncio para calcular revenue
        const { data: ad } = await supabase
            .from('ads')
            .select('cpm')
            .eq('id', ad_id)
            .single()

        const revenue = ad ? ad.cpm / 1000 : 0

        // Registrar impressão (mesmo se bloqueada, para análise)
        const { data: impression, error: insertError } = await supabase
            .from('impressions')
            .insert({
                ad_id,
                slot_id,
                site_id,
                timestamp: new Date().toISOString(),
                ip_address: ipAddress,
                user_agent: userAgent,
                viewport_width: context?.viewport_width,
                viewport_height: context?.viewport_height,
                referrer: context?.referrer,
                page_url: context?.page_url,
                device_type: context?.device_type,
                is_viewable: context?.is_viewable ?? false,
                time_visible: context?.time_visible,
                fraud_score: fraudScore,
                is_blocked: blocked,
                revenue: blocked ? 0 : revenue,
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('Error inserting impression:', insertError)
            throw insertError
        }

        // Se não bloqueada, atualizar métricas
        if (!blocked && impression) {
            await Promise.all([
                updateSlotMetrics(supabase, slot_id, ad_id, revenue),
                updateAdMetrics(supabase, ad_id, revenue),
                createAuditLog(supabase, 'impression_tracked', {
                    impression_id: impression.id,
                    ad_id,
                    slot_id,
                    site_id,
                    fraud_score: fraudScore,
                    revenue,
                }),
            ])
        } else if (blocked) {
            // Log de impressão bloqueada
            await createAuditLog(supabase, 'impression_blocked', {
                impression_id: impression?.id,
                ad_id,
                fraud_score: fraudScore,
                reason: fraudScore >= 80 ? 'high_fraud_score' : 'not_viewable',
            })
        }

        const duration = Date.now() - startTime

        const response: TrackImpressionResponse = {
            success: true,
            impression_id: impression?.id,
            fraud_score: fraudScore,
            blocked,
        }

        console.log(`[IMPRESSION] ${blocked ? 'BLOCKED' : 'TRACKED'} in ${duration}ms (fraud: ${fraudScore})`)

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
        console.error('Error tracking impression:', error)

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
