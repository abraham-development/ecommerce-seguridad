import { NextResponse } from "next/server";
import { mockProducts } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  // Try Supabase
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, images, brand:brands(name)")
      .eq("is_active", true)
      .ilike("name", `%${q}%`)
      .limit(6);

    if (data && data.length > 0) return NextResponse.json(data);
  } catch {
    // Fall back to mock
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
