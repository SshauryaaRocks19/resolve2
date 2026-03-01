import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient | null = null;

function createNoopSupabase(): SupabaseClient {
    console.warn('⚠ Supabase env vars missing — database features disabled.');
    // Chainable no-op proxy: every method call returns the proxy itself,
    // and awaiting it resolves to { data: null, error: null }
    const handler: ProxyHandler<any> = {
        get: (_target, prop) => {
            if (prop === 'then') {
                // When awaited, resolve to { data: null, error: null }
                return (resolve: any) => resolve({ data: null, error: null });
            }
            // Any property access returns a function that returns the proxy
            return (..._args: any[]) => new Proxy({}, handler);
        },
    };
    return new Proxy({}, handler) as SupabaseClient;
}

export const supabase: SupabaseClient = (() => {
    if (!supabaseUrl || !supabaseKey) {
        return createNoopSupabase();
    }
    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseKey);
    }
    return _supabase;
})();