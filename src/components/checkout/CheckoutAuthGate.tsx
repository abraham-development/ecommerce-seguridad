"use client";

import Link from "next/link";
import { Shield, ShoppingBag, CheckCircle, LogIn } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CheckoutAuthGate() {
  const { items, totalPrice } = useCartStore();
  const total = totalPrice();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="border-b border-slate-800 bg-[#1E293B]/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#2563EB]" />
            <span className="font-bold text-white">AFCR Seguridad</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">
                Identificate para continuar
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Necesitás iniciar sesión con Entra para finalizar tu compra y
                hacer seguimiento del pedido.
              </p>
            </div>

            <div className="bg-[#1E293B] rounded-2xl p-7 border border-slate-700">
              <Link
                href="/api/auth/signin/entra-external-id?callbackUrl=/checkout"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Continuar con Entra
              </Link>
            </div>

            <ul className="mt-5 space-y-2">
              {[
                "Seguí el estado de tu pedido",
                "Guardá tus datos de envío para futuras compras",
                "Historial completo de tus compras",
              ].map((text) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 text-sm text-slate-400"
                >
                  <CheckCircle className="h-4 w-4 text-[#2563EB] flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                <h2 className="font-semibold text-white text-sm">Tu pedido</h2>
                <span className="ml-auto text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {itemCount} {itemCount === 1 ? "producto" : "productos"}
                </span>
              </div>

              <ul className="divide-y divide-slate-800">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#2563EB] text-xs font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <p className="text-sm text-slate-200 truncate leading-snug">
                        {item.product.name}
                      </p>
                    </div>
                    <span className="text-sm text-white font-medium flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="px-6 py-4 border-t border-slate-700 bg-[#0F172A]/40">
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
