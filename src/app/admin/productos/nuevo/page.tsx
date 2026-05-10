import ProductForm from "@/components/admin/ProductForm";
import { getBrands, getCategories } from "@/lib/supabase/data";

export default async function NuevoProductoPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Nuevo producto</h1>
      <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
        <ProductForm categories={categories} brands={brands} />
      </div>
    </div>
  );
}
