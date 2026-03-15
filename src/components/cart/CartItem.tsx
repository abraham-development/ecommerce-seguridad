"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItemLocal } from "@/types";

interface CartItemProps {
  item: CartItemLocal;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  const imageUrl =
    product.images?.[0] ||
    `https://via.placeholder.com/80x80/1E293B/2563EB?text=${encodeURIComponent(product.name[0])}`;

  return (
    <li className="flex gap-3 bg-[#0F172A] rounded-xl p-3">
      <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
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

        <div className="flex items-center justify-between mt-2">
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
