"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Category, Brand } from "@/types";

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
}

export default function FilterSidebar({
  categories,
  brands,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key)?.split(",").filter(Boolean) ?? [];
      const idx = current.indexOf(value);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(value);
      }
      if (current.length > 0) {
        params.set(key, current.join(","));
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const selectedBrands = searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice ||
    maxPrice;

  const filterControls = (
    <div className="space-y-6">
      {hasFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearAll}
            className="text-xs text-[#2563EB] hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Categorías</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleMulti("category", cat.slug)}
                    className="h-4 w-4 rounded border-slate-600 bg-[#1E293B] text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-[#0F172A]"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Marcas</h3>
          <ul className="space-y-2">
            {brands.map((brand) => (
              <li key={brand.id}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.name)}
                    onChange={() => toggleMulti("brand", brand.name)}
                    className="h-4 w-4 rounded border-slate-600 bg-[#1E293B] text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-[#0F172A]"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                    {brand.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price range */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Rango de precio
        </h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Mínimo"
            value={minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value || null)}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <input
            type="number"
            placeholder="Máximo"
            value={maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value || null)}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <aside className="w-full flex-shrink-0 lg:w-64">
      <details className="group rounded-xl border border-slate-700 bg-[#1E293B] lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#60A5FA]" />
            Filtros
          </span>
          {hasFilters && (
            <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-xs text-white">
              Activos
            </span>
          )}
        </summary>
        <div className="border-t border-slate-700 p-4">{filterControls}</div>
      </details>
      <div className="hidden lg:block">{filterControls}</div>
    </aside>
  );
}
