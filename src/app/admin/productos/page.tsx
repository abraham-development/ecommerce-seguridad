import Link from "next/link";
import AdminProductosTable from "@/components/admin/AdminProductosTable";
import { getAdminProducts } from "@/lib/supabase/data";

export default async function AdminProductosPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="flex min-h-10 w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 min-[420px]:w-auto"
        >
          + Nuevo producto
        </Link>
      </div>

      <AdminProductosTable initialProducts={products} />
    </div>
  );
}
