import Link from "next/link";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { getOrderStatusLabel, getOrderStatusColor, formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import { getCurrentAccount, getUserOrders } from "@/lib/supabase/data";

export default async function PedidosPage() {
  const [account, orders] = await Promise.all([
    getCurrentAccount(),
    getUserOrders(),
  ]);

  if (!account) {
    redirect("/login?redirect=/cuenta/pedidos");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-white mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-300 font-medium">No tenés pedidos aún</p>
          <Link href="/productos" className="text-[#2563EB] hover:underline text-sm mt-2 inline-block">
            Empezar a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/cuenta/pedidos/${order.id}`}
              className="block rounded-xl border border-slate-700 bg-[#1E293B] p-4 transition-colors hover:border-[#2563EB]/50 sm:p-5"
            >
              <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <div className="min-w-0">
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
                <div className="space-y-1 min-[420px]:text-right">
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
