import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse mb-6" />
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="w-full lg:w-64 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
