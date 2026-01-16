import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { pathname, searchParams } = new URL(req.url);

    try {
        // ========================================================================
        // DASHBOARD OVERVIEW
        // ========================================================================
        if (pathname === '/dashboard/overview') {
            const { data, error } = await supabase
                .from('dashboard_overview')
                .select('*')
                .single();

            if (error) throw error;

            return new Response(JSON.stringify({
                success: true,
                data,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // SITE METRICS
        // ========================================================================
        if (pathname === '/metrics/site') {
            const siteId = searchParams.get('site_id');

            if (!siteId) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'site_id is required',
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const { data, error } = await supabase
                .from('site_metrics_summary')
                .select('*')
                .eq('site_id', siteId)
                .single();

            if (error) throw error;

            return new Response(JSON.stringify({
                success: true,
                data,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // SITE METRICS - ALL SITES
        // ========================================================================
        if (pathname === '/metrics/sites') {
            const { data, error } = await supabase
                .from('site_metrics_summary')
                .select('*')
                .order('revenue_24h', { ascending: false });

            if (error) throw error;

            return new Response(JSON.stringify({
                success: true,
                data,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // AD METRICS
        // ========================================================================
        if (pathname === '/metrics/ad') {
            const adId = searchParams.get('ad_id');

            if (!adId) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'ad_id is required',
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const { data, error } = await supabase
                .from('ad_metrics_summary')
                .select('*')
                .eq('ad_id', adId)
                .single();

            if (error) throw error;

            return new Response(JSON.stringify({
                success: true,
                data,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // AD METRICS - ALL ADS
        // ========================================================================
        if (pathname === '/metrics/ads') {
            const { data, error } = await supabase
                .from('ad_metrics_summary')
                .select('*')
                .order('revenue_24h', { ascending: false });

            if (error) throw error;

            return new Response(JSON.stringify({
                success: true,
                data,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // HOURLY METRICS (Time Series)
        // ========================================================================
        if (pathname === '/metrics/hourly') {
            const siteId = searchParams.get('site_id');
            const adId = searchParams.get('ad_id');
            const hours = parseInt(searchParams.get('hours') || '24');

            let query = supabase
                .from('metrics_hourly')
                .select('hour, impressions, clicks, ctr, revenue_total')
                .gte('hour', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
                .order('hour', { ascending: true });

            if (siteId) {
                query = query.eq('site_id', siteId);
            }

            if (adId) {
                query = query.eq('ad_id', adId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Aggregate by hour if multiple records
            const aggregated = data.reduce((acc, row) => {
                const hour = row.hour;
                if (!acc[hour]) {
                    acc[hour] = {
                        hour,
                        impressions: 0,
                        clicks: 0,
                        revenue_total: 0,
                    };
                }
                acc[hour].impressions += row.impressions;
                acc[hour].clicks += row.clicks;
                acc[hour].revenue_total += parseFloat(row.revenue_total);
                return acc;
            }, {});

            const result = Object.values(aggregated).map((row: any) => ({
                ...row,
                ctr: row.impressions > 0 ? (row.clicks / row.impressions * 100).toFixed(2) : 0,
            }));

            return new Response(JSON.stringify({
                success: true,
                data: result,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // DAILY METRICS (Time Series)
        // ========================================================================
        if (pathname === '/metrics/daily') {
            const siteId = searchParams.get('site_id');
            const adId = searchParams.get('ad_id');
            const days = parseInt(searchParams.get('days') || '30');

            let query = supabase
                .from('metrics_daily')
                .select('date, impressions, clicks, ctr, revenue_total')
                .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .order('date', { ascending: true });

            if (siteId) {
                query = query.eq('site_id', siteId);
            }

            if (adId) {
                query = query.eq('ad_id', adId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Aggregate by date if multiple records
            const aggregated = data.reduce((acc, row) => {
                const date = row.date;
                if (!acc[date]) {
                    acc[date] = {
                        date,
                        impressions: 0,
                        clicks: 0,
                        revenue_total: 0,
                    };
                }
                acc[date].impressions += row.impressions;
                acc[date].clicks += row.clicks;
                acc[date].revenue_total += parseFloat(row.revenue_total);
                return acc;
            }, {});

            const result = Object.values(aggregated).map((row: any) => ({
                ...row,
                ctr: row.impressions > 0 ? (row.clicks / row.impressions * 100).toFixed(2) : 0,
            }));

            return new Response(JSON.stringify({
                success: true,
                data: result,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // REFRESH VIEWS
        // ========================================================================
        if (pathname === '/admin/refresh-views') {
            const { error } = await supabase.rpc('refresh_analytics_views');

            if (error) throw error;

            return new Response(JSON.stringify({
                success: true,
                message: 'Materialized views refreshed successfully',
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ========================================================================
        // NOT FOUND
        // ========================================================================
        return new Response(JSON.stringify({
            success: false,
            error: 'Endpoint not found',
        }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Analytics API Error:', error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message,
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
