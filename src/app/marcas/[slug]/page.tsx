import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
import { mockProducts, mockBrands } from "@/lib/mock-data";
import { generateSlug } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = mockBrands.find((b) => generateSlug(b.name) === slug);
  return {
    title: brand ? `${brand.name} — Cámaras de Seguridad` : "Marca",
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = mockBrands.find((b) => generateSlug(b.name) === slug);
  if (!brand) notFound();
  const products = mockProducts.filter(
    (p) => p.brand && generateSlug(p.brand.name) === slug
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
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
