import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAuthCookieName,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { supabaseFetch } from "@/lib/supabase/fetch";

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookieOptions: { name: getSupabaseAuthCookieName() },
      global: { fetch: supabaseFetch },
    }
  );
}
