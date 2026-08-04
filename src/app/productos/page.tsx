import { Suspense } from "react";
import type { Metadata } from "next";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ProductSort from "@/components/filters/ProductSort";
import ProductGrid from "@/components/products/ProductGrid";
import { getBrands, getCategories, getProducts } from "@/lib/supabase/data";
import type { ProductFilters } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Explorar nuestro catálogo completo de cámaras de seguridad, NVR/DVR y accesorios.",
};

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

  const [{ products, count }, categories, brands] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ]);
  const totalPages = Math.ceil(count / (filters.pageSize ?? 12));
  const currentPage = filters.page ?? 1;

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams(params);
    p.set("page", String(page));
    return `/productos?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-white">
            {params.search ? `Resultados para "${params.search}"` : "Catálogo de productos"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {count} producto{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Suspense fallback={<div className="h-10 w-48 bg-[#1E293B] animate-pulse rounded-lg" />}>
            <ProductSort />
          </Suspense>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <Suspense>
          <FilterSidebar categories={categories} brands={brands} />
        </Suspense>

        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex max-w-full items-center justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
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
