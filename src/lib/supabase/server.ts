import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabaseAuthCookieName,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { supabaseFetch } from "@/lib/supabase/fetch";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookieOptions: { name: getSupabaseAuthCookieName() },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — can't set cookies
          }
        },
      },
      global: { fetch: supabaseFetch },
    }
  );
}
