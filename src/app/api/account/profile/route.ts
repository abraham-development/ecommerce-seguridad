import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import type { Address, Profile } from "@/types";

interface ProfilePayload {
  full_name?: string;
  phone?: string;
  address?: Address;
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ProfilePayload;
  const profile = await queryOne<Profile>(
    `
      UPDATE profiles
      SET
        full_name = $2,
        phone = $3,
        address = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      user.id,
      body.full_name ?? null,
      body.phone ?? null,
      body.address ? JSON.stringify(body.address) : null,
    ]
  );

  return NextResponse.json(profile);
}
