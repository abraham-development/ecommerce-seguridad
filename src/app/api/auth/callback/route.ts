import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLocalSafeOrigin,
  getPostLoginRedirect,
  getSafeRedirectPath,
  isAdminAccount,
} from "@/lib/auth-routing";
import type { UserRole } from "@/types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = getLocalSafeOrigin(requestUrl.origin);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const params = new URLSearchParams({
        redirect: next ?? "/cuenta",
        error: "auth_callback_failed",
      });
      return NextResponse.redirect(new URL(`/login?${params}`, origin));
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single<{ role: UserRole }>();
      const role: UserRole | null = isAdminAccount(profile?.role, user.email)
        ? "admin"
        : profile?.role ?? null;

      return NextResponse.redirect(
        new URL(getPostLoginRedirect(role, next), origin)
      );
    }
  }

  return NextResponse.redirect(new URL(getPostLoginRedirect(null, next), origin));
}
