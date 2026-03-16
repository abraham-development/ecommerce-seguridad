"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const label = product.name.slice(0, 10);
  const imageUrl =
    product.images?.[0] ||
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#1E293B"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#2563EB">${label}</text></svg>`)}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="bg-[#1E293B] rounded-xl overflow-hidden border border-slate-700/50 hover:border-[#2563EB]/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
        {/* Image */}
        <div className="relative h-52 bg-slate-800 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2">
              <span className="bg-[#F97316] text-white text-xs font-bold px-2 py-1 rounded-full">
                ¡Últimas unidades!
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {(product.brand || product.category) && (
            <div className="flex items-center gap-2 mb-1">
              {product.brand && (
                <span className="text-xs text-[#2563EB] font-medium">
                  {product.brand.name}
                </span>
              )}
              {product.category && (
                <span className="text-xs text-slate-500">
                  · {product.category.name}
                </span>
              )}
            </div>
          )}

          <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug mb-2 group-hover:text-[#2563EB] transition-colors">
            {product.name}
          </h3>

          {product.specs?.resolution && (
            <p className="text-xs text-slate-500 mb-3">
              {product.specs.resolution}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xl font-bold text-white">
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-slate-500">IVA incluido</p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
