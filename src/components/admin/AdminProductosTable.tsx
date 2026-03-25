"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable from "@/components/admin/AdminTable";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Product } from "@/types";

interface AdminProductosTableProps {
  initialProducts: Product[];
}

export default function AdminProductosTable({ initialProducts }: AdminProductosTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Producto eliminado");
    } else {
      toast.error("Error al eliminar");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Producto",
      render: (p: Product) => (
        <div>
          <p className="font-medium text-white line-clamp-1">{p.name}</p>
          <p className="text-xs text-slate-500">{p.brand?.name}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Categoría",
      render: (p: Product) => (
        <span className="text-slate-400">{p.category?.name ?? "—"}</span>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (p: Product) => (
        <span className="font-medium text-white">{formatPrice(p.price)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (p: Product) => (
        <span className={p.stock <= 5 ? "text-red-400" : "text-slate-300"}>
          {p.stock}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (p: Product) =>
        p.is_active ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="ghost">Inactivo</Badge>
        ),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      data={products}
      loading={false}
      onEdit={(p) => router.push(`/admin/productos/${p.id}/editar`)}
      onDelete={handleDelete}
      emptyMessage="No hay productos"
    />
  );
}
