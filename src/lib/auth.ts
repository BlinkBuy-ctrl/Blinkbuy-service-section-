import { supabase } from "./supabase";

const THEME_KEY = "blinkbuy_services_theme";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  role: "customer" | "worker" | "both" | "admin";
  location?: string;
  profilePhoto?: string;
  bio?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isTrusted?: boolean;
  rating?: number;
  reviewCount?: number;
  jobsCompleted?: number;
}

export function getTheme(): "light" | "dark" {
  return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
}

export function setTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function formatMK(amount: number | null | undefined): string {
  if (!amount) return "Negotiable";
  return `MK ${amount.toLocaleString()}`;
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, queryParams: { prompt: "select_account" } },
  });
  if (error) throw new Error(error.message || "Google sign-in failed.");
}
