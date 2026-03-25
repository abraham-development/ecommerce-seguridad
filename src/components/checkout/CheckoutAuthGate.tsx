"use client";

import { useState } from "react";
import { Shield, ShoppingBag, CheckCircle } from "lucide-react";
import LoginForm from "@/components/checkout/LoginForm";
import RegisterForm from "@/components/checkout/RegisterForm";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Tab = "login" | "registro";

interface Props {
  onSuccess: (user: SupabaseUser) => void;
}

export default function CheckoutAuthGate({ onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const { items, totalPrice } = useCartStore();
  const total = totalPrice();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Top progress bar */}
      <div className="border-b border-slate-800 bg-[#1E293B]/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#2563EB]" />
            <span className="font-bold text-white">AFCR Seguridad</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">1</span>
              <span className="font-medium text-white">Cuenta</span>
            </div>
            <div className="w-8 h-px bg-slate-700" />
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="w-5 h-5 rounded-full border border-slate-600 text-slate-500 flex items-center justify-center font-bold text-xs">2</span>
              <span>Datos</span>
            </div>
            <div className="w-8 h-px bg-slate-700" />
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="w-5 h-5 rounded-full border border-slate-600 text-slate-500 flex items-center justify-center font-bold text-xs">3</span>
              <span>Pago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Auth form */}
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">
                Identificate para continuar
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Necesitás una cuenta para finalizar tu compra y hacer seguimiento de tu pedido.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#1E293B] rounded-xl p-1 mb-6 border border-slate-700">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === "login"
                    ? "bg-[#2563EB] text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ya tengo cuenta
              </button>
              <button
                onClick={() => setTab("registro")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === "registro"
                    ? "bg-[#2563EB] text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Crear cuenta nueva
              </button>
            </div>

            <div className="bg-[#1E293B] rounded-2xl p-7 border border-slate-700">
              {tab === "login" ? (
                <LoginForm
                  onSuccess={onSuccess}
                  onSwitchToRegister={() => setTab("registro")}
                />
              ) : (
                <RegisterForm
                  onSuccess={onSuccess}
                  onSwitchToLogin={() => setTab("login")}
                />
              )}
            </div>

            {/* Benefits */}
            <ul className="mt-5 space-y-2">
              {[
                "Seguí el estado de tu pedido en tiempo real",
                "Guardá tus datos de envío para futuras compras",
                "Historial completo de todas tus compras",
              ].map((text) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <CheckCircle className="h-4 w-4 text-[#2563EB] flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                <h2 className="font-semibold text-white text-sm">
                  Tu pedido
                </h2>
                <span className="ml-auto text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {itemCount} {itemCount === 1 ? "producto" : "productos"}
                </span>
              </div>

              <ul className="divide-y divide-slate-800">
                {items.map((item) => (
                  <li key={item.product.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#2563EB] text-xs font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate leading-snug">
                          {item.product.name}
                        </p>
                        {item.product.brand && (
                          <p className="text-xs text-slate-500">{item.product.brand.name}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white font-medium flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="px-6 py-4 space-y-2.5 border-t border-slate-700 bg-[#0F172A]/40">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Envío</span>
                  <span className="text-slate-400 italic">A calcular</span>
                </div>
                <div className="flex justify-between font-semibold text-white pt-2.5 border-t border-slate-700">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-slate-700 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#2563EB] flex-shrink-0" />
                <p className="text-xs text-slate-500">
                  Pago 100% seguro con cifrado SSL
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
