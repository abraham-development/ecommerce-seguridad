import Link from "next/link";
import { mockOrders } from "@/lib/mock-data";
import Badge from "@/components/ui/Badge";
import { getOrderStatusLabel, getOrderStatusColor, formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

export default function PedidosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Mis pedidos</h1>

      {mockOrders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-300 font-medium">No tenés pedidos aún</p>
          <Link href="/productos" className="text-[#2563EB] hover:underline text-sm mt-2 inline-block">
            Empezar a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Link
              key={order.id}
              href={`/cuenta/pedidos/${order.id}`}
              className="block bg-[#1E293B] border border-slate-700 rounded-xl p-5 hover:border-[#2563EB]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">
                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-white">{formatPrice(order.total)}</p>
                  <Badge className={getOrderStatusColor(order.status)} variant="ghost">
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
