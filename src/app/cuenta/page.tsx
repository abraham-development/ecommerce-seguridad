import Link from "next/link";
import { Package, User, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentAccount, getUserOrders } from "@/lib/supabase/data";
import { isAdminAccount } from "@/lib/auth-routing";
import {
  formatPersonName,
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";
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

  const profileName = formatPersonName(
    account.profile?.names,
    account.profile?.surnames
  );
  const displayName = profileName || account.user.email || "Mi cuenta";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-white mb-8">Mi cuenta</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User info */}
        <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
              <User className="h-6 w-6 text-[#2563EB]" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{displayName}</p>
              <p className="break-all text-sm text-slate-400">{account.user.email}</p>
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
            <a
              href="/api/auth/signout"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </a>
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-xl border border-slate-700 bg-[#1E293B] p-4 sm:p-6 md:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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
                  className="flex flex-col gap-3 rounded-lg bg-[#0F172A] p-3 transition-colors hover:bg-slate-800 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="space-y-1 min-[420px]:text-right">
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
