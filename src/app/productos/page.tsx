import { Suspense } from "react";
import type { Metadata } from "next";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import { mockProducts, mockCategories, mockBrands } from "@/lib/mock-data";
import type { Product, ProductFilters } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Explorar nuestro catálogo completo de cámaras de seguridad, NVR/DVR y accesorios.",
};

async function getProducts(filters: ProductFilters): Promise<{ products: Product[]; count: number }> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)", { count: "exact" })
      .eq("is_active", true);

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters.category) {
      const slugs = filters.category.split(",");
      query = query.in("category.slug", slugs);
    }
    if (filters.brand) {
      const brands = filters.brand.split(",");
      query = query.in("brand.name", brands);
    }
    if (filters.minPrice) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);

    switch (filters.sortBy) {
      case "price_asc": query = query.order("price", { ascending: true }); break;
      case "price_desc": query = query.order("price", { ascending: false }); break;
      case "name_asc": query = query.order("name", { ascending: true }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count } = await query;
    if (data && data.length > 0) return { products: data as Product[], count: count ?? 0 };
  } catch {
    // Fall back to mock
  }

  let products = [...mockProducts];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (filters.category) {
    const slugs = filters.category.split(",");
    products = products.filter((p) => p.category && slugs.includes(p.category.slug));
  }
  if (filters.brand) {
    const brands = filters.brand.split(",");
    products = products.filter((p) => p.brand && brands.includes(p.brand.name));
  }
  if (filters.minPrice) products = products.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice) products = products.filter((p) => p.price <= filters.maxPrice!);

  switch (filters.sortBy) {
    case "price_asc": products.sort((a, b) => a.price - b.price); break;
    case "price_desc": products.sort((a, b) => b.price - a.price); break;
    case "name_asc": products.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  return { products: products.slice(start, start + pageSize), count: products.length };
}

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: ProductFilters = {
    search: params.search,
    category: params.category,
    brand: params.brand,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sortBy: params.sortBy as ProductFilters["sortBy"],
    page: params.page ? Number(params.page) : 1,
    pageSize: 12,
  };

  const { products, count } = await getProducts(filters);
  const totalPages = Math.ceil(count / (filters.pageSize ?? 12));
  const currentPage = filters.page ?? 1;

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams(params);
    p.set("page", String(page));
    return `/productos?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {params.search ? `Resultados para "${params.search}"` : "Catálogo de productos"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {count} producto{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense>
          <FilterSidebar categories={mockCategories} brands={mockBrands} />
        </Suspense>

        <div className="flex-1">
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="p-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <Link
                    key={page}
                    href={buildPageUrl(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-[#2563EB] text-white"
                        : "bg-[#1E293B] border border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="p-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
