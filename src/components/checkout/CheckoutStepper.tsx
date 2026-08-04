"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import {
  getLimaMetropolitanaDistricts,
  resolvePeruLocation,
} from "@/lib/peru-ubigeo";
import {
  getUrbanoPickupPoint,
  getUrbanoPickupPoints,
} from "@/data/urbano-pickup-points";
import { formatPrice } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import PeruDepartmentMap from "@/components/checkout/PeruDepartmentMap";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  CreditCard,
  Info,
  MapPin,
  Package,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ShippingMethod } from "@/types";

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
    names: "",
    surnames: "",
    mobile: "",
    shippingMethod: "" as ShippingMethod | "",
    districtCode: "",
    street: "",
    reference: "",
    pickupDepartmentCode: "",
    pickupPointId: "",
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const total = totalPrice();
  const limaDistricts = getLimaMetropolitanaDistricts();
  const pickupPoints = getUrbanoPickupPoints(shipping.pickupDepartmentCode);
  const selectedPickupPoint = getUrbanoPickupPoint(shipping.pickupPointId);
  const canContinueShipping =
    shipping.shippingMethod === "lima_delivery"
      ? Boolean(
          shipping.districtCode &&
            shipping.street.trim() &&
            shipping.reference.trim()
        )
      : shipping.shippingMethod === "urbano_pickup"
        ? Boolean(selectedPickupPoint)
        : false;

  const goNext = () => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setCurrentStep(next.id);
  };

  const goBack = () => {
    const previous = STEPS[currentStepIndex - 1];
    if (previous) setCurrentStep(previous.id);
  };

  const handlePlaceOrder = async () => {
    if (!shipping.shippingMethod) {
      toast.error("Selecciona una modalidad de envío.");
      return;
    }

    const selectedUbigeo =
      shipping.shippingMethod === "lima_delivery"
        ? shipping.districtCode
        : selectedPickupPoint?.districtCode ?? "";
    const location = resolvePeruLocation(selectedUbigeo);

    if (!location) {
      toast.error("Selecciona una ubicación válida.");
      return;
    }

    if (
      shipping.shippingMethod === "urbano_pickup" &&
      !selectedPickupPoint
    ) {
      toast.error("Selecciona un punto Urbano para continuar.");
      return;
    }

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
            names: shipping.names,
            surnames: shipping.surnames,
            mobile: shipping.mobile,
            shippingMethod: shipping.shippingMethod,
            street:
              shipping.shippingMethod === "lima_delivery"
                ? shipping.street
                : selectedPickupPoint?.address ?? "",
            reference:
              shipping.shippingMethod === "lima_delivery"
                ? shipping.reference
                : selectedPickupPoint?.reference ?? "",
            department: location.department.name,
            province: location.province.name,
            district: location.district.name,
            ubigeo: location.district.code,
            country: "Perú",
            pickupPointId: selectedPickupPoint?.id,
            pickupPointName: selectedPickupPoint?.name,
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
    <div className="mx-auto max-w-3xl">
      {/* Steps */}
      <div className="relative mb-8 grid grid-cols-4 gap-1 sm:mb-10 sm:gap-3">
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-slate-700" />
        {STEPS.map((step, i) => (
          <div key={step.id} className="relative z-10 flex min-w-0 flex-col items-center gap-2 text-center">
            <div
              className={`flex flex-col items-center gap-2 ${
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
              <span className="hidden text-xs font-medium min-[420px]:block">
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="space-y-6 rounded-xl bg-[#1E293B] p-4 sm:p-6">
        {currentStep === "datos" && (
          <>
            <h2 className="text-lg font-semibold text-white">Datos personales</h2>
            <div className="space-y-4">
              <Input
                label="Nombres"
                value={shipping.names}
                onChange={(e) =>
                  setShipping({ ...shipping, names: e.target.value })
                }
                autoComplete="given-name"
                placeholder="Juan Carlos"
                required
              />
              <Input
                label="Apellidos"
                value={shipping.surnames}
                onChange={(e) =>
                  setShipping({ ...shipping, surnames: e.target.value })
                }
                autoComplete="family-name"
                placeholder="Pérez García"
                required
              />
              <Input
                label="Celular"
                type="tel"
                value={shipping.mobile}
                onChange={(e) =>
                  setShipping({ ...shipping, mobile: e.target.value })
                }
                leftIcon={<Smartphone className="h-4 w-4" />}
                autoComplete="tel"
                placeholder="+51 999 999 999"
                required
              />
            </div>
            <Button
              onClick={goNext}
              disabled={!shipping.names || !shipping.surnames || !shipping.mobile}
              className="w-full"
            >
              Continuar
            </Button>
          </>
        )}

        {currentStep === "envio" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-white">
                ¿Cómo recibirás tu pedido?
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Elige una modalidad para ver las opciones disponibles.
              </p>
            </div>

            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Modalidad de envío"
            >
              <button
                type="button"
                role="radio"
                aria-checked={shipping.shippingMethod === "lima_delivery"}
                onClick={() =>
                  setShipping({
                    ...shipping,
                    shippingMethod: "lima_delivery",
                  })
                }
                className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  shipping.shippingMethod === "lima_delivery"
                    ? "border-blue-400 bg-blue-500/10 ring-1 ring-blue-400"
                    : "border-slate-700 bg-[#0F172A] hover:border-slate-500"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                    <Truck className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">
                      Lima Metropolitana
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      Delivery hasta tu vivienda
                    </span>
                  </span>
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={shipping.shippingMethod === "urbano_pickup"}
                onClick={() =>
                  setShipping({
                    ...shipping,
                    shippingMethod: "urbano_pickup",
                  })
                }
                className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  shipping.shippingMethod === "urbano_pickup"
                    ? "border-orange-400 bg-orange-500/10 ring-1 ring-orange-400"
                    : "border-slate-700 bg-[#0F172A] hover:border-slate-500"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                    <Store className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">
                      Provincias
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      Recojo en un punto Urbano
                    </span>
                  </span>
                </span>
              </button>
            </div>

            {shipping.shippingMethod === "lima_delivery" && (
              <div className="space-y-4 rounded-xl border border-blue-500/25 bg-blue-500/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">
                      Dirección para delivery
                    </h3>
                    <p className="text-sm text-slate-400">
                      Disponible en los distritos de Lima Metropolitana y Callao.
                    </p>
                  </div>
                </div>
                <Select
                  id="shipping-district"
                  label="Distrito"
                  value={shipping.districtCode}
                  onChange={(event) =>
                    setShipping({
                      ...shipping,
                      districtCode: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Selecciona un distrito</option>
                  {limaDistricts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                      {district.provinceName === "Callao" ? " (Callao)" : ""}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Calle y número de su vivienda"
                  value={shipping.street}
                  onChange={(event) =>
                    setShipping({ ...shipping, street: event.target.value })
                  }
                  autoComplete="street-address"
                  placeholder="Ej. Av. Arequipa 1234"
                  required
                />
                <Input
                  label="Referencia para ubicar su vivienda fácilmente"
                  value={shipping.reference}
                  onChange={(event) =>
                    setShipping({ ...shipping, reference: event.target.value })
                  }
                  placeholder="Ej. Frente al parque, puerta azul"
                  required
                />
              </div>
            )}

            {shipping.shippingMethod === "urbano_pickup" && (
              <div className="space-y-4 rounded-xl border border-orange-500/25 bg-orange-500/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                  <div>
                    <h3 className="font-semibold text-white">
                      Elige dónde recogerás tu pedido
                    </h3>
                    <p className="text-sm text-slate-400">
                      Selecciona un departamento para encontrar el punto Urbano
                      más cercano.
                    </p>
                  </div>
                </div>

                <PeruDepartmentMap
                  value={shipping.pickupDepartmentCode}
                  onChange={(departmentCode) =>
                    setShipping({
                      ...shipping,
                      pickupDepartmentCode: departmentCode,
                      pickupPointId: "",
                    })
                  }
                />

                {shipping.pickupDepartmentCode && pickupPoints.length === 0 && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-200">
                        Puntos Urbano pendientes de cargar
                      </p>
                      <p className="mt-1 text-slate-400">
                        La selección del departamento ya está lista. El checkout
                        se habilitará cuando añadamos el listado oficial de puntos
                        de recojo de Urbano.
                      </p>
                      {shipping.pickupDepartmentCode === "15" && (
                        <p className="mt-2 text-xs text-slate-500">
                          En esta modalidad, Lima representa sus provincias fuera
                          de Lima Metropolitana.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {pickupPoints.length > 0 && (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium text-slate-300">
                      Punto Urbano
                    </legend>
                    {pickupPoints.map((point) => (
                      <label
                        key={point.id}
                        className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                          shipping.pickupPointId === point.id
                            ? "border-orange-400 bg-orange-500/10"
                            : "border-slate-700 bg-[#0F172A]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickup-point"
                          value={point.id}
                          checked={shipping.pickupPointId === point.id}
                          onChange={() =>
                            setShipping({
                              ...shipping,
                              pickupPointId: point.id,
                            })
                          }
                          className="mt-1 accent-orange-500"
                        />
                        <span className="text-sm">
                          <span className="block font-medium text-white">
                            {point.name}
                          </span>
                          <span className="mt-1 block text-slate-400">
                            {point.address}
                          </span>
                          {point.schedule && (
                            <span className="mt-1 block text-xs text-slate-500">
                              {point.schedule}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={goBack}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                onClick={goNext}
                disabled={!canContinueShipping}
                className="w-full flex-1"
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {currentStep === "pago" && (
          <>
            <h2 className="text-lg font-semibold text-white">Resumen y pago</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 break-words text-slate-300">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="flex-shrink-0 font-medium text-white">
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

            <div className="rounded-lg border border-slate-700 bg-[#0F172A] p-4 text-sm">
              <p className="mb-1 font-medium text-slate-300">
                Modalidad de entrega
              </p>
              {shipping.shippingMethod === "lima_delivery" ? (
                <p className="flex items-center gap-2 text-slate-400">
                  <Truck className="h-4 w-4 text-blue-400" />
                  Delivery en Lima Metropolitana
                </p>
              ) : (
                <p className="flex items-center gap-2 text-slate-400">
                  <Store className="h-4 w-4 text-orange-400" />
                  Recojo en {selectedPickupPoint?.name ?? "punto Urbano"}
                </p>
              )}
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={goBack}
                variant="outline"
                disabled={loading}
                className="w-full sm:w-auto"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                onClick={handlePlaceOrder}
                loading={loading}
                className="w-full flex-1"
                size="lg"
              >
                Confirmar pedido — {formatPrice(total)}
              </Button>
            </div>
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
              {shipping.shippingMethod === "urbano_pickup"
                ? "Te avisaremos cuando tu pedido esté listo para recoger en el punto Urbano seleccionado."
                : "Nos pondremos en contacto para coordinar el delivery."}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => router.push("/cuenta/pedidos")} variant="outline" className="w-full sm:w-auto">
                Ver mis pedidos
              </Button>
              <Button onClick={() => router.push("/productos")} className="w-full sm:w-auto">
                Seguir comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
