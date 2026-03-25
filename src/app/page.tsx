import Link from "next/link";
import { Shield, Camera, Zap, Award, ChevronRight } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import { withMockFallback } from "@/lib/data-utils";
import type { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  return withMockFallback(async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (!data || data.length === 0) throw new Error("No data");
    return data as Product[];
  }, mockProducts.slice(0, 8));
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(249,115,22,0.08),_transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">
                AFCR Seguridad
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tu hogar y negocio{" "}
              <span className="text-[#2563EB]">siempre protegidos</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
              Especialistas en sistemas de videovigilancia. Cámaras IP, domo,
              PTZ, NVR/DVR y accesorios de Hikvision, Dahua, Axis, Reolink y más.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/productos"
                className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Ver catálogo completo
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/categorias/camaras-ip"
                className="flex items-center gap-2 px-6 py-3 border border-slate-600 hover:border-[#2563EB] text-white font-semibold rounded-xl transition-colors"
              >
                Cámaras IP
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16">
            {[
              { label: "Productos", value: "200+" },
              { label: "Marcas líderes", value: "6" },
              { label: "Clientes", value: "5,000+" },
              { label: "Años de experiencia", value: "10+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-[#2563EB]">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#1E293B] py-12 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Camera className="h-6 w-6 text-[#2563EB]" />,
                title: "Alta definición",
                desc: "Cámaras desde 2MP hasta 4K Ultra HD",
              },
              {
                icon: <Zap className="h-6 w-6 text-[#F97316]" />,
                title: "Instalación rápida",
                desc: "Soporte técnico y puesta en marcha incluido",
              },
              {
                icon: <Award className="h-6 w-6 text-[#2563EB]" />,
                title: "Garantía oficial",
                desc: "Distribuidores autorizados de las mejores marcas",
              },
            ].map((feat) => (
              <div key={feat.title} className="flex items-start gap-4 p-4">
                <div className="p-2.5 bg-[#0F172A] rounded-xl flex-shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Categorías</h2>
          <Link
            href="/productos"
            className="text-sm text-[#2563EB] hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Ver todo <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {mockCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="bg-[#1E293B] hover:bg-[#2563EB]/10 border border-slate-700/50 hover:border-[#2563EB]/50 rounded-xl p-4 text-center transition-all duration-200 group"
            >
              <div className="text-2xl mb-2">
                {cat.slug === "camaras-ip" && "🌐"}
                {cat.slug === "domo" && "🔘"}
                {cat.slug === "ptz" && "🎯"}
                {cat.slug === "exterior" && "🏠"}
                {cat.slug === "interior" && "🏢"}
                {cat.slug === "nvr-dvr" && "💾"}
                {cat.slug === "accesorios" && "🔧"}
              </div>
              <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Productos destacados</h2>
          <Link
            href="/productos"
            className="text-sm text-[#2563EB] hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>
    </div>
  );
}
