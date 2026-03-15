"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import CartItem from "@/components/cart/CartItem";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, clearCart, totalPrice } = useCartStore();
  const total = totalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-20 w-20 text-slate-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h1>
        <p className="text-slate-400 mb-8">
          Explorá nuestros productos y encontrá lo que necesitás para proteger
          tu hogar o negocio.
        </p>
        <Link href="/productos">
          <Button size="lg">Ver productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">
          Carrito ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#1E293B] rounded-xl p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-semibold text-white">Resumen</h2>

            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-400 line-clamp-1 flex-1 mr-2">
                  {item.product.name} ×{item.quantity}
                </span>
                <span className="text-white">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}

            <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-2xl font-bold text-white">
                {formatPrice(total)}
              </span>
            </div>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                Finalizar compra
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/productos">
              <Button variant="ghost" className="w-full text-slate-400">
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
