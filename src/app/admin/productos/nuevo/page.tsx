import ProductForm from "@/components/admin/ProductForm";
import { getBrands, getCategories } from "@/lib/supabase/data";

export default async function NuevoProductoPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white sm:mb-8">Nuevo producto</h1>
      <div className="rounded-xl border border-slate-700 bg-[#1E293B] p-4 sm:p-6">
        <ProductForm categories={categories} brands={brands} />
      </div>
    </div>
  );
}
