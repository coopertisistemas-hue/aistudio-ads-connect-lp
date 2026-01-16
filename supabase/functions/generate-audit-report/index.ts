import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { start_date, end_date, entity_type, user_id, action } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Build query
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })

        if (start_date) {
            query = query.gte('created_at', start_date)
        }

        if (end_date) {
            query = query.lte('created_at', end_date)
        }

        if (entity_type) {
            query = query.eq('entity_type', entity_type)
        }

        if (user_id) {
            query = query.eq('user_id', user_id)
        }

        if (action) {
            query = query.eq('action', action)
        }

        const { data: logs, error } = await query

        if (error) throw error

        // Generate statistics
        const stats = {
            total: logs?.length || 0,
            byAction: logs?.reduce((acc, log) => {
                acc[log.action] = (acc[log.action] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            byEntity: logs?.reduce((acc, log) => {
                acc[log.entity_type] = (acc[log.entity_type] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            byUser: logs?.reduce((acc, log) => {
                const email = log.user_email || 'Unknown'
                acc[email] = (acc[email] || 0) + 1
                return acc
            }, {} as Record<string, number>)
        }

        // Format for CSV export
        const csvData = logs?.map(log => ({
            date: new Date(log.created_at).toLocaleString('pt-BR'),
            user: log.user_email || 'System',
            action: log.action,
            entity_type: log.entity_type,
            entity_id: log.entity_id || '',
            ip_address: log.ip_address || ''
        }))

        return new Response(
            JSON.stringify({
                success: true,
                stats,
                logs: logs || [],
                csvData,
                generatedAt: new Date().toISOString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
