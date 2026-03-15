"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { ShoppingCart, Shield, Truck, RotateCcw } from "lucide-react";
import ProductGallery from "@/components/products/ProductGallery";
import ProductSpecs from "@/components/products/ProductSpecs";
import ProductGrid from "@/components/products/ProductGrid";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/types";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    // Find product in mock data
    const found = mockProducts.find((p) => p.slug === params.slug) ?? null;
    setProduct(found);
    if (found) {
      const rel = mockProducts
        .filter(
          (p) =>
            p.id !== found.id &&
            (p.category_id === found.category_id ||
              p.brand_id === found.brand_id)
        )
        .slice(0, 4);
      setRelated(rel);
    }
  }, [params.slug]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-400">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-white transition-colors">Inicio</a>
        <span>/</span>
        <a href="/productos" className="hover:text-white transition-colors">Productos</a>
        {product.category && (
          <>
            <span>/</span>
            <a
              href={`/categorias/${product.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {product.category.name}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-slate-300 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
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

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">
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
            <div className="grid grid-cols-2 gap-2">
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
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-400 hover:text-white transition-colors text-lg"
                >
                  −
                </button>
                <span className="text-white font-medium w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-slate-400 hover:text-white transition-colors text-lg"
                >
                  +
                </button>
              </div>

              <Button onClick={handleAddToCart} size="lg" className="flex-1">
                <ShoppingCart className="h-4 w-4" />
                Agregar al carrito
              </Button>
            </div>
          )}

          {/* Trust badges */}
          <div className="border-t border-slate-700 pt-4 grid grid-cols-3 gap-3">
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
        <div className="mb-16">
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
