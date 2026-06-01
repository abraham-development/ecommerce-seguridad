"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("sortBy", value);
      } else {
        params.delete("sortBy");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const sortBy = searchParams.get("sortBy") ?? "";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Ordenar por:</span>
      <select
        value={sortBy}
        onChange={(e) => updateSort(e.target.value)}
        className="bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
      >
        <option value="">Relevancia</option>
        <option value="price_asc">Precio: menor a mayor</option>
        <option value="price_desc">Precio: mayor a menor</option>
        <option value="name_asc">Nombre A-Z</option>
        <option value="newest">Más nuevos</option>
      </select>
    </div>
  );
}
