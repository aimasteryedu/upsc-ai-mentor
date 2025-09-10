import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

/**
 * Creates a Supabase client with the provided URL and key
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options = {}
) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
    ...options,
  });
}

// Singleton Supabase client for server-side use (Edge Functions)
let _supabaseAdminClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Gets or creates a Supabase client with admin permissions
 * This should only be used in server-side code (Edge Functions)
 */
export function getSupabaseAdmin() {
  if (!_supabaseAdminClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment variables"
      );
    }

    _supabaseAdminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey);
  }

  return _supabaseAdminClient;
}
