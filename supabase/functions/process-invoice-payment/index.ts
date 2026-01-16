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
        const { invoice_id, payment_method, paid_date } = await req.json()

        if (!invoice_id || !payment_method) {
            throw new Error('invoice_id and payment_method are required')
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Get invoice details
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, client_id, subscription_id')
            .eq('id', invoice_id)
            .single()

        if (invoiceError) throw invoiceError

        // Update invoice status
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                paid_date: paid_date || new Date().toISOString(),
                payment_method
            })
            .eq('id', invoice_id)

        if (updateError) throw updateError

        // Update client total revenue
        const { error: clientError } = await supabase
            .rpc('increment_client_revenue', {
                client_uuid: invoice.client_id,
                amount: invoice.total
            })

        // Create audit log
        await supabase.from('audit_logs').insert({
            action: 'update',
            entity_type: 'invoice',
            entity_id: invoice_id,
            changes: {
                status: 'paid',
                payment_method,
                paid_date: paid_date || new Date().toISOString()
            }
        })

        // If subscription invoice, update next billing date
        if (invoice.subscription_id) {
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('next_billing_date')
                .eq('id', invoice.subscription_id)
                .single()

            if (subscription) {
                const nextBilling = new Date(subscription.next_billing_date)
                nextBilling.setMonth(nextBilling.getMonth() + 1)

                await supabase
                    .from('subscriptions')
                    .update({ next_billing_date: nextBilling.toISOString() })
                    .eq('id', invoice.subscription_id)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                invoice_id,
                status: 'paid',
                paid_date: paid_date || new Date().toISOString()
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
