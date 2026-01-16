import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Get all active subscriptions
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('value, plan_id, plans(name)')
            .eq('status', 'active')

        if (error) throw error

        // Calculate MRR
        const mrr = subscriptions?.reduce((sum, sub) => sum + parseFloat(sub.value), 0) || 0

        // Calculate by plan
        const mrrByPlan = subscriptions?.reduce((acc, sub) => {
            const planName = sub.plans?.name || 'Unknown'
            acc[planName] = (acc[planName] || 0) + parseFloat(sub.value)
            return acc
        }, {} as Record<string, number>)

        // Calculate churn rate (simplified - last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { count: cancelledCount } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .gte('updated_at', thirtyDaysAgo.toISOString())

        const { count: totalCount } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })

        const churnRate = totalCount > 0 ? ((cancelledCount || 0) / totalCount) * 100 : 0

        return new Response(
            JSON.stringify({
                mrr,
                mrrByPlan,
                activeSubscriptions: subscriptions?.length || 0,
                churnRate: parseFloat(churnRate.toFixed(2)),
                calculatedAt: new Date().toISOString()
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
