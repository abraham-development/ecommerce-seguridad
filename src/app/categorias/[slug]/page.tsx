import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "@/lib/supabase/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category ? `${category.name} — Cámaras de Seguridad` : "Categoría",
    description: category?.description ?? "",
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProductsByCategorySlug(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">
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
