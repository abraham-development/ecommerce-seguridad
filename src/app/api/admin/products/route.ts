import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import type { Product, ProductSpecs } from "@/types";

interface ProductPayload {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  brand_id?: string | null;
  category_id?: string | null;
  images?: string[];
  specs?: ProductSpecs;
  is_active?: boolean;
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as ProductPayload;
  if (!body.name || body.price === undefined || body.stock === undefined) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const product = await queryOne<Product>(
    `
      INSERT INTO products (
        name,
        slug,
        description,
        price,
        stock,
        brand_id,
        category_id,
        images,
        specs,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
    [
      body.name,
      generateSlug(body.name),
      body.description ?? null,
      body.price,
      body.stock,
      body.brand_id ?? null,
      body.category_id ?? null,
      body.images ?? [],
      JSON.stringify(body.specs ?? {}),
      body.is_active ?? true,
    ]
  );

  return NextResponse.json(product, { status: 201 });
}
