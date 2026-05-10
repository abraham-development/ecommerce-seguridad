import Link from "next/link";
import AdminProductosTable from "@/components/admin/AdminProductosTable";
import { getAdminProducts } from "@/lib/supabase/data";

export default async function AdminProductosPage() {
  const products = await getAdminProducts();

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
