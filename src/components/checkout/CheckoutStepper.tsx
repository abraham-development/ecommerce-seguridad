"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

type Step = "datos" | "envio" | "pago" | "confirmacion";

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "datos", label: "Datos", icon: <Package className="h-4 w-4" /> },
  { id: "envio", label: "Envío", icon: <MapPin className="h-4 w-4" /> },
  { id: "pago", label: "Pago", icon: <CreditCard className="h-4 w-4" /> },
  {
    id: "confirmacion",
    label: "Confirmación",
    icon: <CheckCircle className="h-4 w-4" />,
  },
];

export default function CheckoutStepper() {
  const [currentStep, setCurrentStep] = useState<Step>("datos");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [shipping, setShipping] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Argentina",
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const total = totalPrice();

  const goNext = () => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setCurrentStep(next.id);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            unit_price: i.product.price,
          })),
          shipping_address: {
            street: shipping.street,
            city: shipping.city,
            state: shipping.state,
            postal_code: shipping.postal_code,
            country: shipping.country,
          },
          total,
        }),
      });

      if (!res.ok) throw new Error("Error al crear la orden");

      const data = await res.json();
      setOrderId(data.id);
      clearCart();
      setCurrentStep("confirmacion");
    } catch {
      toast.error("Error al procesar tu pedido. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 ${
                i < currentStepIndex
                  ? "text-green-400"
                  : i === currentStepIndex
                  ? "text-[#2563EB]"
                  : "text-slate-600"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  i < currentStepIndex
                    ? "border-green-400 bg-green-400/20"
                    : i === currentStepIndex
                    ? "border-[#2563EB] bg-[#2563EB]/20"
                    : "border-slate-600"
                }`}
              >
                {i < currentStepIndex ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs font-medium hidden sm:block">
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 mx-3 ${
                  i < currentStepIndex ? "bg-green-400" : "bg-slate-700"
                }`}
                style={{ minWidth: "2rem" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[#1E293B] rounded-xl p-6 space-y-6">
        {currentStep === "datos" && (
          <>
            <h2 className="text-lg font-semibold text-white">Datos personales</h2>
            <div className="space-y-4">
              <Input
                label="Nombre completo"
                value={shipping.full_name}
                onChange={(e) =>
                  setShipping({ ...shipping, full_name: e.target.value })
                }
                required
              />
              <Input
                label="Teléfono"
                type="tel"
                value={shipping.phone}
                onChange={(e) =>
                  setShipping({ ...shipping, phone: e.target.value })
                }
              />
            </div>
            <Button onClick={goNext} disabled={!shipping.full_name} className="w-full">
              Continuar
            </Button>
          </>
        )}

        {currentStep === "envio" && (
          <>
            <h2 className="text-lg font-semibold text-white">Dirección de envío</h2>
            <div className="space-y-4">
              <Input
                label="Calle y número"
                value={shipping.street}
                onChange={(e) =>
                  setShipping({ ...shipping, street: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ciudad"
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping({ ...shipping, city: e.target.value })
                  }
                  required
                />
                <Input
                  label="Provincia"
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping({ ...shipping, state: e.target.value })
                  }
                />
              </div>
              <Input
                label="Código postal"
                value={shipping.postal_code}
                onChange={(e) =>
                  setShipping({ ...shipping, postal_code: e.target.value })
                }
              />
            </div>
            <Button
              onClick={goNext}
              disabled={!shipping.street || !shipping.city}
              className="w-full"
            >
              Continuar
            </Button>
          </>
        )}

        {currentStep === "pago" && (
          <>
            <h2 className="text-lg font-semibold text-white">Resumen y pago</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-300">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-white font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-xl font-bold text-white">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-4 text-sm text-slate-400">
              <p className="font-medium text-slate-300 mb-1">
                Método de pago
              </p>
              <p>
                Integración con MercadoPago/Stripe próximamente. Por ahora el
                pedido se confirma directamente.
              </p>
            </div>

            <Button onClick={handlePlaceOrder} loading={loading} className="w-full" size="lg">
              Confirmar pedido — {formatPrice(total)}
            </Button>
          </>
        )}

        {currentStep === "confirmacion" && (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              ¡Pedido confirmado!
            </h2>
            {orderId && (
              <p className="text-slate-400 text-sm">
                Número de orden:{" "}
                <span className="text-white font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
            <p className="text-slate-400 text-sm">
              Nos pondremos en contacto para coordinar la entrega.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/cuenta/pedidos")} variant="outline">
                Ver mis pedidos
              </Button>
              <Button onClick={() => router.push("/productos")}>
                Seguir comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
