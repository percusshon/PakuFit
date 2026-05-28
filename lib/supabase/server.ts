import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

export function getServerClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
