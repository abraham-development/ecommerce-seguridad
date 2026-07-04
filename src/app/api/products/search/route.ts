import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { mockProducts } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await query(
      `
        SELECT
          p.id,
          p.name,
          p.slug,
          p.price,
          p.images,
          row_to_json(b.*) AS brand
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = TRUE
          AND (
            p.name ILIKE $1
            OR b.name ILIKE $1
            OR c.name ILIKE $1
          )
        ORDER BY p.created_at DESC
        LIMIT 6
      `,
      [`%${q}%`]
    );

    if (results.length > 0) return NextResponse.json(results);
  } catch {
    // Fall back to mock products for local demo mode.
  }

  const results = mockProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    )
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      images: p.images,
      brand: p.brand ? { name: p.brand.name } : null,
    }));

  return NextResponse.json(results);
}
