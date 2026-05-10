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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Tu hogar y negocio{" "}
              <span className="text-[#2563EB]">siempre protegidos</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Especialistas en sistemas de videovigilancia. Cámaras IP, domo,
              PTZ, NVR/DVR y accesorios de Hikvision, Dahua, Axis, Reolink y más.
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Ver todos los productos
              <ChevronRight className="h-4 w-4" />
            </Link>
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
