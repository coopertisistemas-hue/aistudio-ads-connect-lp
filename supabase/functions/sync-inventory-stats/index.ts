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
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Get all inventory sites
        const { data: sites, error: sitesError } = await supabase
            .from('inventory')
            .select('site_id, site_name')

        if (sitesError) throw sitesError

        const syncResults = []

        for (const site of sites || []) {
            // Count total slots
            const { count: totalSlots } = await supabase
                .from('ad_slots')
                .select('*', { count: 'exact', head: true })
                .eq('site_id', site.site_id)

            // Count occupied slots (with current_ad_id)
            const { count: occupiedSlots } = await supabase
                .from('ad_slots')
                .select('*', { count: 'exact', head: true })
                .eq('site_id', site.site_id)
                .not('current_ad_id', 'is', null)

            // Calculate revenue and impressions
            const { data: slotStats } = await supabase
                .from('ad_slots')
                .select('revenue, impressions')
                .eq('site_id', site.site_id)

            const totalRevenue = slotStats?.reduce((sum, slot) => sum + parseFloat(slot.revenue || 0), 0) || 0
            const totalImpressions = slotStats?.reduce((sum, slot) => sum + parseInt(slot.impressions || 0), 0) || 0

            // Update inventory
            const { error: updateError } = await supabase
                .from('inventory')
                .update({
                    total_slots: totalSlots || 0,
                    occupied_slots: occupiedSlots || 0,
                    available_slots: (totalSlots || 0) - (occupiedSlots || 0),
                    revenue: totalRevenue,
                    impressions: totalImpressions,
                    last_sync_at: new Date().toISOString()
                })
                .eq('site_id', site.site_id)

            if (updateError) {
                syncResults.push({ site_id: site.site_id, success: false, error: updateError.message })
            } else {
                syncResults.push({
                    site_id: site.site_id,
                    success: true,
                    stats: {
                        total_slots: totalSlots || 0,
                        occupied_slots: occupiedSlots || 0,
                        revenue: totalRevenue,
                        impressions: totalImpressions
                    }
                })
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                synced: syncResults.length,
                results: syncResults,
                syncedAt: new Date().toISOString()
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
