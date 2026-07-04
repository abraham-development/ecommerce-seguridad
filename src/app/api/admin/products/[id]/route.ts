import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import type { Product, ProductSpecs } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

export async function PUT(request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as ProductPayload;
  const product = await queryOne<Product>(
    `
      UPDATE products
      SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = $4,
        price = COALESCE($5, price),
        stock = COALESCE($6, stock),
        brand_id = $7,
        category_id = $8,
        images = COALESCE($9, images),
        specs = COALESCE($10, specs),
        is_active = COALESCE($11, is_active),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      body.name ?? null,
      body.name ? generateSlug(body.name) : null,
      body.description ?? null,
      body.price ?? null,
      body.stock ?? null,
      body.brand_id ?? null,
      body.category_id ?? null,
      body.images ?? null,
      body.specs ? JSON.stringify(body.specs) : null,
      body.is_active ?? null,
    ]
  );

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await query("DELETE FROM products WHERE id = $1", [id]);

  return NextResponse.json({ success: true });
}
