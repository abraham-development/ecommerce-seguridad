import Link from "next/link";
import { Camera, Zap, Award, ChevronRight } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { getCategories, getFeaturedProducts } from "@/lib/supabase/data";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#0F172A] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold leading-tight text-white min-[420px]:text-4xl sm:text-5xl lg:text-6xl mb-5">
              Tu hogar y negocio{" "}
              <span className="text-[#2563EB]">siempre protegidos</span>
            </h1>
            <p className="mb-8 text-base leading-relaxed text-slate-400 sm:text-lg">
              Especialistas en sistemas de videovigilancia. Cámaras IP, domo,
              PTZ, NVR/DVR y accesorios de Hikvision, Dahua, Axis, Reolink y más.
            </p>
            <Link
              href="/productos"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 min-[420px]:w-auto"
            >
              Ver todos los productos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-700/50 bg-[#1E293B] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
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
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-white">Categorías</h2>
          <Link
            href="/productos"
            className="text-sm text-[#2563EB] hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Ver todo <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((cat) => (
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
      <section className="max-w-7xl mx-auto px-4 py-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
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
