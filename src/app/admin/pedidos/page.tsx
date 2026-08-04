import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import {
  formatPersonName,
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";

export default async function AdminPedidosPage() {
  let orders: Record<string, unknown>[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, profile:profiles(names, surnames)")
      .order("created_at", { ascending: false })
      .limit(50);
    orders = (data as Record<string, unknown>[]) ?? [];
  } catch {
    orders = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pedidos</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-[#1E293B] p-8 text-center text-slate-400 sm:p-12">
          No hay pedidos aún
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full min-w-[680px]">
            <thead className="bg-[#1E293B] border-b border-slate-700">
              <tr>
                {["ID", "Cliente", "Total", "Estado", "Fecha"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-[#0F172A]">
              {orders.map((order) => (
                <tr key={order.id as string} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">
                    #{(order.id as string).slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatPersonName(
                      (order.profile as Record<string, unknown>)?.names as string,
                      (order.profile as Record<string, unknown>)?.surnames as string
                    ) || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    {formatPrice(order.total as number)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={getOrderStatusColor(order.status as string)}
                      variant="ghost"
                    >
                      {getOrderStatusLabel(order.status as string)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(order.created_at as string).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
