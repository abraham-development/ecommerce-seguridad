"use client";

import { memo } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItemLocal } from "@/types";

interface CartItemProps {
  item: CartItemLocal;
}

function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  const label = product.name[0];
  const imageUrl =
    product.images?.[0] ||
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#1E293B"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#2563EB">${label}</text></svg>`)}`;

  return (
    <li className="flex gap-3 rounded-xl bg-[#0F172A] p-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800 min-[380px]:h-20 min-[380px]:w-20">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white line-clamp-2">
          {product.name}
        </p>
        {product.brand && (
          <p className="text-xs text-slate-500 mt-0.5">{product.brand.name}</p>
        )}
        <p className="text-[#2563EB] font-semibold text-sm mt-1">
          {formatPrice(product.price)}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              aria-label="Disminuir"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-white text-sm font-medium w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
              aria-label="Aumentar"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={() => removeItem(product.id)}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default memo(CartItem);
