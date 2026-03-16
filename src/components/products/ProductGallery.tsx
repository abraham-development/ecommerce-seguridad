"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const label = productName.slice(0, 15);
  const displayImages =
    images.length > 0
      ? images
      : [
          `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="600" height="450" fill="#1E293B"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#2563EB">${label}</text></svg>`)}`,
        ];

  const current = displayImages[selectedIndex];

  const prev = () =>
    setSelectedIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  const next = () =>
    setSelectedIndex((i) => (i + 1) % displayImages.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-[#1E293B] rounded-xl overflow-hidden group">
        <Image
          src={current}
          alt={`${productName} - imagen ${selectedIndex + 1}`}
          fill
          className={`object-contain transition-transform duration-300 ${
            zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setZoomed(!zoomed)}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Zoom hint */}
        {!zoomed && (
          <div className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4" />
          </div>
        )}

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? "w-4 bg-[#2563EB]"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selectedIndex
                  ? "border-[#2563EB]"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
