import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { getOrderStatusLabel, getOrderStatusColor, formatPrice } from "@/lib/utils";
import { Package, MapPin } from "lucide-react";
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Pedido #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <div className="flex items-center gap-3 mt-2">
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
        <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#2563EB]" /> Productos
          </h2>
          <ul className="divide-y divide-slate-700">
            {items.map((item) => {
              const product = item.product;
              return (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      {product?.name ?? "Producto"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatPrice(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-medium">
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

        {/* Shipping */}
        <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#2563EB]" /> Dirección de envío
          </h2>
          <address className="not-italic text-sm text-slate-400 space-y-1">
            <p>{order.shipping_address.street}</p>
            <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
            <p>CP {order.shipping_address.postal_code}, {order.shipping_address.country}</p>
          </address>
        </div>
      </div>
    </div>
  );
}
