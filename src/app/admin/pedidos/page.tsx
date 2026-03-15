import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { getOrderStatusLabel, getOrderStatusColor, formatPrice } from "@/lib/utils";

export default async function AdminPedidosPage() {
  let orders: Record<string, unknown>[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, profile:profiles(full_name)")
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
        <div className="bg-[#1E293B] rounded-xl p-12 border border-slate-700 text-center text-slate-400">
          No hay pedidos aún
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full">
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
                    {((order.profile as Record<string, unknown>)?.full_name as string) ?? "—"}
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
