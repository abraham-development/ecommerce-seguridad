import ProductForm from "@/components/admin/ProductForm";
import { mockCategories, mockBrands } from "@/lib/mock-data";

export default function NuevoProductoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Nuevo producto</h1>
      <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
        <ProductForm categories={mockCategories} brands={mockBrands} />
      </div>
    </div>
  );
}
