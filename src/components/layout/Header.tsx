"use client";

import { useSyncExternalStore, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { User } from "@supabase/supabase-js";
import { isAdminAccount } from "@/lib/auth-routing";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/carrito", label: "Carrito" },
  { href: "/acerca-de-nosotros", label: "Acerca de Nosotros" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCartStore();
  const itemCount = totalItems();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;
    let authRevision = 0;
    let subscription: { unsubscribe: () => void } | null = null;
    const scheduledAuthSyncs = new Set<number>();

    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const syncAccountState = async (nextUser: User | null) => {
          const revision = ++authRevision;

          if (!active) return;

          setUser(nextUser);
          setIsAdmin(false);

          if (!nextUser) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", nextUser.id)
            .single();

          if (!active || revision !== authRevision) return;

          setIsAdmin(isAdminAccount(profile?.role, nextUser.email));
        };

        // Initial check
        const { data: { user } } = await supabase.auth.getUser();
        await syncAccountState(user);
        if (!active) return;
        setAuthChecked(true);

        // Supabase can deadlock when its async APIs are awaited directly inside
        // onAuthStateChange. Defer profile synchronization until Auth releases
        // its internal lock.
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            const timeoutId = window.setTimeout(() => {
              scheduledAuthSyncs.delete(timeoutId);
              void syncAccountState(session?.user ?? null).catch(() => {
                if (active) setIsAdmin(false);
              });
            }, 0);

            scheduledAuthSyncs.add(timeoutId);
          }
        );
        subscription = sub;
      } catch {
        if (active) setAuthChecked(true);
      }
    };

    void checkAuth();

    return () => {
      active = false;
      authRevision += 1;
      scheduledAuthSyncs.forEach((timeoutId) => window.clearTimeout(timeoutId));
      scheduledAuthSyncs.clear();
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 shadow-lg">
      {/* Top bar */}
      <div className="bg-[#1E293B] border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <Shield className="h-7 w-7 flex-shrink-0 text-[#2563EB]" />
              <span className="truncate text-base font-bold text-white min-[380px]:text-lg">
                AFCR <span className="text-[#2563EB]">Tecnologia</span>
              </span>
            </Link>

            {/* Desktop auth buttons / User actions */}
            <div className="hidden items-center gap-2 md:flex">
              {mounted && authChecked && user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 text-sm font-medium text-white bg-[#2563EB]/20 border border-[#2563EB]/40 rounded-lg hover:bg-[#2563EB]/30 transition-colors"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Link
                    href="/cuenta"
                    className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Mi Cuenta
                  </Link>
                  <a
                    href="/api/auth/signout"
                    className="px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Cerrar Sesión
                  </a>
                </>
              ) : (
                mounted && authChecked && (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-[#2563EB] border border-[#2563EB] rounded-lg hover:bg-[#2563EB]/10 transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )
              )}
            </div>

            {/* Mobile actions */}
            <div className="ml-3 flex flex-shrink-0 items-center gap-1 md:hidden">
              <Link
                href="/carrito"
                className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label="Ver carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[10px] font-bold text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop nav bar */}
      <nav className="hidden bg-[#0F172A] border-b border-slate-700/50 md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-11 items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 h-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 border-b-2 ${
                  isActive(link.href)
                    ? "text-white border-[#2563EB]"
                    : "text-slate-400 hover:text-white border-transparent"
                }`}
              >
                {link.label === "Carrito" ? (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Carrito</span>
                    {mounted && itemCount > 0 && (
                      <span className="h-5 min-w-5 px-1 bg-[#F97316] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-b border-slate-700 bg-[#0F172A] px-4 py-4 md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1">
            {NAV_LINKS.filter((link) => link.href !== "/carrito").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-[#2563EB]/15 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-3 border-t border-slate-700" />

            {mounted && authChecked ? (
              user ? (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-300 hover:bg-blue-500/10"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Panel Admin
                    </Link>
                  )}
                  <Link
                    href="/cuenta"
                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <UserRound className="h-4 w-4" /> Mi Cuenta
                  </Link>
                  <a
                    href="/api/auth/signout"
                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                  <Link
                    href="/login"
                    className="flex min-h-11 items-center justify-center rounded-lg border border-[#2563EB] px-4 py-2 text-sm font-medium text-[#60A5FA]"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="flex min-h-11 items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
                  >
                    Registrarse
                  </Link>
                </div>
              )
            ) : (
              <div className="h-11 animate-pulse rounded-lg bg-slate-800" />
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
