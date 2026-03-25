import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
import { mockProducts, mockCategories } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);
  return {
    title: category ? `${category.name} — Cámaras de Seguridad` : "Categoría",
    description: category?.description ?? "",
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);
  if (!category) notFound();
  const products = mockProducts.filter(
    (p) => p.category?.slug === slug || p.category_id === category?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {category?.name ?? slug}
        </h1>
        {category?.description && (
          <p className="text-slate-400 mt-2">{category.description}</p>
        )}
        <p className="text-slate-500 text-sm mt-1">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ProductGrid
        products={products}
        emptyMessage="No hay productos en esta categoría"
      />
    </div>
  );
}
