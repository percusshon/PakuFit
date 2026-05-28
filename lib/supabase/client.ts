import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

let singleton: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  if (!singleton) {
    singleton = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return singleton;
}
