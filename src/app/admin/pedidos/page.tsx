import Badge from "@/components/ui/Badge";
import { query } from "@/lib/db";
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  formatPrice,
} from "@/lib/utils";

interface AdminOrderRow {
  id: string;
  total: string | number;
  status: string;
  created_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default async function AdminPedidosPage() {
  let orders: AdminOrderRow[] = [];

  try {
    orders = await query<AdminOrderRow>(
      `
        SELECT
          o.id,
          o.total,
          o.status,
          o.created_at,
          row_to_json(p.*) AS profile
        FROM orders o
        LEFT JOIN profiles p ON p.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 50
      `
    );
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
                <tr
                  key={order.id}
                  className="hover:bg-[#1E293B]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {order.profile?.full_name ?? order.profile?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={getOrderStatusColor(order.status)}
                      variant="ghost"
                    >
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(order.created_at).toLocaleDateString("es-AR")}
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
