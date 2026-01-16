// Type definitions for Deno runtime in Edge Functions
// This file provides TypeScript support without requiring the Deno extension

declare namespace Deno {
    export namespace env {
        export function get(key: string): string | undefined;
    }
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
    export function serve(
        handler: (request: Request) => Response | Promise<Response>
    ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
    export interface SupabaseClient {
        from(table: string): any;
        rpc(fn: string, params?: any): any;
    }

    export function createClient(
        supabaseUrl: string,
        supabaseKey: string,
        options?: any
    ): SupabaseClient;
}
