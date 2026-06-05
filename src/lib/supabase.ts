import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[BlinkBuy Services] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.\n" +
    "Copy .env.example to .env and fill in your Supabase project credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "blinkbuy_services_auth_token",
    storage: window.localStorage,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
    timeout: 20000,
  },
  global: {
    headers: { "X-Client-Info": "blinkbuy-services-app" },
  },
});
