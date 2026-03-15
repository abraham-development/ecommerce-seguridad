import ProductForm from "@/components/admin/ProductForm";
import { mockCategories, mockBrands, mockProducts } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Editar producto</h1>
      <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
        <ProductForm
          product={product}
          categories={mockCategories}
          brands={mockBrands}
        />
      </div>
    </div>
  );
}
