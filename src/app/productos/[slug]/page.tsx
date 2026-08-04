import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Truck, RotateCcw } from "lucide-react";
import ProductGallery from "@/components/products/ProductGallery";
import ProductSpecs from "@/components/products/ProductSpecs";
import ProductGrid from "@/components/products/ProductGrid";
import AddToCartButton from "@/components/products/AddToCartButton";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/supabase/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} — AFCR Seguridad` : "Producto no encontrado",
    description: product?.description ?? "",
    openGraph: {
      title: product?.name,
      images: product?.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-white transition-colors">Productos</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/categorias/${product.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="max-w-[14rem] truncate text-slate-300 sm:max-w-md">{product.name}</span>
      </nav>

      <div className="mb-12 grid grid-cols-1 gap-8 lg:mb-16 lg:grid-cols-2 lg:gap-10">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <span className="text-sm font-medium text-[#2563EB]">
                {product.brand.name}
              </span>
            )}
            <h1 className="text-2xl font-bold text-white mt-1 leading-snug">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-white sm:text-3xl">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 ? (
              <Badge variant="success">
                {product.stock <= 5
                  ? `¡Solo ${product.stock} en stock!`
                  : "En stock"}
              </Badge>
            ) : (
              <Badge variant="danger">Sin stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="text-slate-400 leading-relaxed">{product.description}</p>
          )}

          {/* Quick specs */}
          {Object.keys(product.specs).length > 0 && (
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              {Object.entries(product.specs)
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="bg-[#1E293B] rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-500 capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-white font-medium">{String(value)}</p>
                  </div>
                ))}
            </div>
          )}

          {/* Quantity + Add to cart */}
          <AddToCartButton product={product} />

          {/* Trust badges */}
          <div className="grid grid-cols-1 gap-3 border-t border-slate-700 pt-4 min-[420px]:grid-cols-3">
            {[
              { icon: <Shield className="h-4 w-4 text-[#2563EB]" />, label: "Garantía oficial" },
              { icon: <Truck className="h-4 w-4 text-[#2563EB]" />, label: "Envío a todo el país" },
              { icon: <RotateCcw className="h-4 w-4 text-[#2563EB]" />, label: "30 días devolución" },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1 text-center">
                {t.icon}
                <span className="text-xs text-slate-400">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs table */}
      {Object.keys(product.specs).length > 0 && (
        <div className="mb-12 sm:mb-16">
          <ProductSpecs specs={product.specs} />
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Productos relacionados</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
