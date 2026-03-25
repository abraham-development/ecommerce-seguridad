"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  if (product.stock === 0) return null;

  return (
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
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
  );
}
