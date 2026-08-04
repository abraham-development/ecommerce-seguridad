import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import {
  formatPersonName,
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";
import { Package, MapPin, Store } from "lucide-react";
import { getUserOrder } from "@/lib/supabase/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const order = await getUserOrder(id);
  if (!order) notFound();

  const items = order.order_items ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Pedido #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-slate-400 text-sm">
            {new Date(order.created_at).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <Badge className={getOrderStatusColor(order.status)} variant="ghost">
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <div className="rounded-xl border border-slate-700 bg-[#1E293B] p-4 sm:p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#2563EB]" /> Productos
          </h2>
          <ul className="divide-y divide-slate-700">
            {items.map((item) => {
              const product = item.product;
              return (
                <li key={item.id} className="flex flex-col gap-2 py-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium">
                      {product?.name ?? "Producto"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatPrice(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-white min-[420px]:text-right">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-700 pt-3 mt-3 flex items-center justify-between">
            <span className="font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-white">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Shipping or pickup */}
        <div className="rounded-xl border border-slate-700 bg-[#1E293B] p-4 sm:p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            {order.shipping_address.shippingMethod === "urbano_pickup" ? (
              <Store className="h-4 w-4 text-[#F97316]" />
            ) : (
              <MapPin className="h-4 w-4 text-[#2563EB]" />
            )}
            {order.shipping_address.shippingMethod === "urbano_pickup"
              ? "Punto de recojo Urbano"
              : "Dirección de delivery"}
          </h2>
          <address className="not-italic text-sm text-slate-400 space-y-1">
            <p className="font-medium text-slate-200">
              {formatPersonName(
                order.shipping_address.names,
                order.shipping_address.surnames
              )}
            </p>
            <p>{order.shipping_address.mobile}</p>
            {order.shipping_address.pickupPointName && (
              <p className="font-medium text-orange-300">
                {order.shipping_address.pickupPointName}
              </p>
            )}
            <p>{order.shipping_address.street}</p>
            <p>
              Referencia: {order.shipping_address.reference}
            </p>
            <p>
              {order.shipping_address.district}, {order.shipping_address.province}
            </p>
            <p>
              {order.shipping_address.department}, {order.shipping_address.country}
            </p>
          </address>
        </div>
      </div>
    </div>
  );
}
