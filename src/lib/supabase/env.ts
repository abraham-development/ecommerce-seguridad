export function getSupabaseUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }

  return supabaseUrl;
}

export function getSupabasePublishableKey(): string {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
    );
  }

  return publishableKey;
}

export function getSupabaseAuthCookieName(): string {
  const hostname = new URL(getSupabaseUrl()).hostname;
  const projectRef = hostname.split(".")[0]?.replace(/[^a-zA-Z0-9-]/g, "");

  if (!projectRef) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must contain a valid project host");
  }

  return `afcr-${projectRef}-auth-v2`;
}
