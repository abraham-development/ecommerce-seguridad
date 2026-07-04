import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { uploadProductImage } from "@/lib/blob";

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const url = await uploadProductImage(file);
  return NextResponse.json({ url }, { status: 201 });
}
