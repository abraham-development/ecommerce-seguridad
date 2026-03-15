"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { User } from "lucide-react";
import { mockUser } from "@/lib/mock-data";
import toast from "react-hot-toast";

export default function PerfilPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: mockUser.full_name ?? "",
    phone: mockUser.phone ?? "",
    street: mockUser.address?.street ?? "",
    city: mockUser.address?.city ?? "",
    state: mockUser.address?.state ?? "",
    postal_code: mockUser.address?.postal_code ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Perfil actualizado (modo demo)");
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
          <User className="h-5 w-5 text-[#2563EB]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Editar perfil</h1>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            <Input
              label="Teléfono"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Dirección</p>
            <div className="space-y-3">
              <Input
                label="Calle y número"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ciudad"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="Provincia"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <Input
                label="Código postal"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  );
}
