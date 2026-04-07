import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;

const FLYER_BUCKET = "event-flyers";

export function getFlyerPublicUrl(flyerPath: string | null): string | null {
  if (!flyerPath || !supabase) return null;
  const { data } = supabase.storage.from(FLYER_BUCKET).getPublicUrl(flyerPath);
  return data.publicUrl;
}
