"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { Address, Profile } from "@/types";

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    street: profile.address?.street ?? "",
    city: profile.address?.city ?? "",
    state: profile.address?.state ?? "",
    postal_code: profile.address?.postal_code ?? "",
    country: profile.address?.country ?? "Argentina",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const address: Address = {
      street: form.street,
      city: form.city,
      state: form.state,
      postal_code: form.postal_code,
      country: form.country,
    };

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name,
        phone: form.phone,
        address,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      toast.error("No se pudo actualizar el perfil");
      return;
    }

    toast.success("Perfil actualizado");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre completo"
          value={form.full_name}
          onChange={(event) =>
            setForm({ ...form, full_name: event.target.value })
          }
        />
        <Input
          label="Teléfono"
          type="tel"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">Dirección</p>
        <div className="space-y-3">
          <Input
            label="Calle y número"
            value={form.street}
            onChange={(event) =>
              setForm({ ...form, street: event.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              value={form.city}
              onChange={(event) =>
                setForm({ ...form, city: event.target.value })
              }
            />
            <Input
              label="Provincia"
              value={form.state}
              onChange={(event) =>
                setForm({ ...form, state: event.target.value })
              }
            />
          </div>
          <Input
            label="Código postal"
            value={form.postal_code}
            onChange={(event) =>
              setForm({ ...form, postal_code: event.target.value })
            }
          />
        </div>
      </div>

      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        Guardar cambios
      </Button>
    </form>
  );
}
