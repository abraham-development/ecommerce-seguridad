import { NextResponse } from "next/server";
import {
  getPostLoginRedirect,
  getLocalSafeOrigin,
  getSafeRedirectPath,
  isAdminAccount,
  USER_DASHBOARD_PATH,
} from "@/lib/auth-routing";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = getLocalSafeOrigin(requestUrl.origin);
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const params = new URLSearchParams({
      redirect: next ?? USER_DASHBOARD_PATH,
      error: "session_required",
    });
    return NextResponse.redirect(new URL(`/login?${params}`, origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: UserRole }>();

  const role: UserRole | null = isAdminAccount(profile?.role, user.email)
    ? "admin"
    : profile?.role ?? null;
  const destination = getPostLoginRedirect(role, next);

  if (next?.startsWith("/admin") && role !== "admin") {
    const params = new URLSearchParams({
      redirect: "/admin",
      error: "admin_required",
    });
    return NextResponse.redirect(new URL(`/login?${params}`, origin));
  }

  return NextResponse.redirect(new URL(destination, origin));
}
