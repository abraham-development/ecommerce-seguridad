"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/carrito", label: "Carrito" },
  { href: "/acerca-de-nosotros", label: "Acerca de Nosotros" },
];

export default function Header() {
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const itemCount = totalItems();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 shadow-lg">
      {/* Top bar */}
      <div className="bg-[#1E293B] border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Shield className="h-7 w-7 text-[#2563EB]" />
              <span className="font-bold text-white text-lg">
                AFCR <span className="text-[#2563EB]">Seguridad</span>
              </span>
            </Link>

            {/* Auth buttons */}
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="bg-[#0F172A] border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto gap-1 h-11">
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
                    {itemCount > 0 && (
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
    </header>
  );
}
