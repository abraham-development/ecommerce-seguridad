import Link from "next/link";
import AdminProductosTable from "@/components/admin/AdminProductosTable";
import { mockProducts } from "@/lib/mock-data";
import { withMockFallback } from "@/lib/data-utils";
import type { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  return withMockFallback(async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) throw new Error("No data");
    return data as Product[];
  }, mockProducts);
}

export default async function AdminProductosPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <AdminProductosTable initialProducts={products} />
    </div>
  );
}
