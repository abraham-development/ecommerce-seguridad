import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
import { getBrandBySlug, getProductsByBrandSlug } from "@/lib/supabase/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return {
    title: brand ? `${brand.name} — Cámaras de Seguridad` : "Marca",
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const products = await getProductsByBrandSlug(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">
          {brand?.name ?? slug}
        </h1>
        {brand?.description && (
          <p className="text-slate-400 mt-2">{brand.description}</p>
        )}
        <p className="text-slate-500 text-sm mt-1">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ProductGrid
        products={products}
        emptyMessage="No hay productos de esta marca"
      />
    </div>
  );
}
