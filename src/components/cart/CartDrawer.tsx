"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import CartItem from "./CartItem";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const total = totalPrice();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 flex h-[100dvh] w-full max-w-md flex-col bg-[#1E293B] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#2563EB]" />
            <h2 className="text-lg font-semibold text-white">Carrito</h2>
            {items.length > 0 && (
              <span className="bg-[#2563EB] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart className="h-16 w-16 text-slate-600" />
              <div>
                <p className="text-slate-300 font-medium">Tu carrito está vacío</p>
                <p className="text-slate-500 text-sm mt-1">
                  Explorá nuestros productos y agregá lo que necesitás
                </p>
              </div>
              <Button onClick={closeCart} variant="outline" size="sm">
                Ver productos
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-slate-700 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-semibold text-lg">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Envío calculado en el checkout
            </p>
            <Link href="/checkout" onClick={closeCart} className="block">
              <Button className="w-full" size="lg">
                Finalizar compra
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/carrito" onClick={closeCart} className="block">
              <Button variant="ghost" className="w-full text-slate-400">
                Ver carrito completo
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
