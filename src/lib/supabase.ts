import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isMisconfigured = !supabaseUrl || !supabaseAnonKey ||
  supabaseUrl === "your-supabase-url" ||
  supabaseAnonKey === "your-supabase-anon-key";

if (isMisconfigured) {
  console.warn(
    "[BlinkBuy Services] Supabase env vars missing or using placeholders.\n" +
    "The app will run in offline/demo mode.\n" +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings."
  );
}

// Use fallback placeholder values so createClient never receives undefined
// (undefined causes an immediate crash before ErrorBoundary can render)
export const supabase = createClient(
  supabaseUrl  || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
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
  }
);

export const isSupabaseConfigured = !isMisconfigured;
