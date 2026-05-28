export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "パクフィット / PakuFit",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
};

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
