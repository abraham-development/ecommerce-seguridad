"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category, Brand } from "@/types";
import toast from "react-hot-toast";

interface ProductFormProps {
  product?: Partial<Product>;
  categories: Category[];
  brands: Brand[];
}

export default function ProductForm({
  product,
  categories,
  brands,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product?.id;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    category_id: product?.category_id ?? "",
    brand_id: product?.brand_id ?? "",
    is_active: product?.is_active ?? true,
    specs: JSON.stringify(product?.specs ?? {}, null, 2),
  });

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);
        uploaded.push(urlData.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success("Imágenes subidas correctamente");
    } catch (err) {
      toast.error("Error al subir imágenes");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let specs = {};
    try {
      specs = JSON.parse(form.specs);
    } catch {
      toast.error("Las especificaciones no son JSON válido");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      is_active: form.is_active,
      images,
      specs,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al guardar");

      toast.success(isEditing ? "Producto actualizado" : "Producto creado");
      router.push("/admin/productos");
      router.refresh();
    } catch {
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Nombre del producto *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio (ARS) *"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              label="Stock *"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Categoría
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Marca
              </label>
              <select
                value={form.brand_id}
                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Sin marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-600 bg-[#1E293B] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <label htmlFor="is_active" className="text-sm text-slate-300">
              Producto activo (visible en la tienda)
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Imágenes
            </label>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#2563EB] transition-colors">
              <Upload className="h-6 w-6 text-slate-400 mb-2" />
              <span className="text-sm text-slate-400">
                {uploading ? "Subiendo..." : "Clic para subir imágenes"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden bg-slate-800">
                    <Image src={img} alt={`img-${i}`} fill className="object-cover" sizes="80px" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Especificaciones (JSON)
            </label>
            <textarea
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              rows={10}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              placeholder='{"resolution": "4MP", "night_vision": "30m"}'
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <Button type="submit" loading={saving}>
          {isEditing ? "Actualizar producto" : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/productos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
