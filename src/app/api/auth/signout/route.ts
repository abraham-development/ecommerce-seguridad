import { NextResponse } from "next/server";
import { getLocalSafeOrigin } from "@/lib/auth-routing";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: Request) {
  const supabase = await createClient();
  const requestUrl = new URL(request.url);
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", getLocalSafeOrigin(requestUrl.origin)));
}

export async function GET(request: Request) {
  return signOut(request);
}

export async function POST(request: Request) {
  return signOut(request);
}
