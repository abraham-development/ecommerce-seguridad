import Link from "next/link";
import { Package, User, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentAccount, getUserOrders } from "@/lib/supabase/data";
import { isAdminAccount } from "@/lib/auth-routing";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export default async function CuentaPage() {
  const [account, recentOrders] = await Promise.all([
    getCurrentAccount(),
    getUserOrders(5),
  ]);

  if (!account) {
    redirect("/login?redirect=/cuenta");
  }

  if (isAdminAccount(account.profile?.role, account.user.email)) {
    redirect("/admin");
  }

  const displayName =
    account.profile?.full_name ?? account.user.email ?? "Mi cuenta";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Mi cuenta</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User info */}
        <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
              <User className="h-6 w-6 text-[#2563EB]" />
            </div>
            <div>
              <p className="font-semibold text-white">{displayName}</p>
              <p className="text-sm text-slate-400">{account.user.email}</p>
            </div>
          </div>

          <div className="space-y-1 mt-4">
            <Link
              href="/cuenta/pedidos"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Package className="h-4 w-4" /> Mis pedidos
            </Link>
            <Link
              href="/cuenta/perfil"
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <User className="h-4 w-4" /> Editar perfil
            </Link>
            <Link
              href="/api/auth/signout?callbackUrl=/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="md:col-span-2 bg-[#1E293B] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Últimos pedidos</h2>
            <Link href="/cuenta/pedidos" className="text-sm text-[#2563EB] hover:underline">
              Ver todos
            </Link>
          </div>

          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/cuenta/pedidos/${order.id}`}
                  className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-white">
                      {formatPrice(order.total)}
                    </p>
                    <Badge className={getOrderStatusColor(order.status)} variant="ghost">
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
