"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getPeruDistricts,
  getPeruProvinces,
  PERU_DEPARTMENTS,
  resolvePeruLocation,
} from "@/lib/peru-ubigeo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import toast from "react-hot-toast";
import type { Address, Profile } from "@/types";

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const initialUbigeo = profile.address?.ubigeo ?? "";
  const [form, setForm] = useState({
    names: profile.names ?? "",
    surnames: profile.surnames ?? "",
    mobile: profile.mobile ?? "",
    departmentCode: initialUbigeo.slice(0, 2),
    provinceCode: initialUbigeo.slice(0, 4),
    districtCode: initialUbigeo,
    street: profile.address?.street ?? "",
    reference: profile.address?.reference ?? "",
  });
  const provinces = getPeruProvinces(form.departmentCode);
  const districts = getPeruDistricts(form.provinceCode);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const location = resolvePeruLocation(form.districtCode);
    if (!location) {
      setSaving(false);
      toast.error("Selecciona un departamento, provincia y distrito válidos");
      return;
    }

    const address: Address = {
      street: form.street.trim(),
      reference: form.reference.trim(),
      department: location.department.name,
      province: location.province.name,
      district: location.district.name,
      ubigeo: location.district.code,
      country: "Perú",
    };

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        names: form.names,
        surnames: form.surnames,
        mobile: form.mobile,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      toast.error("No se pudo actualizar el perfil");
      return;
    }

    toast.success("Perfil actualizado");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nombres"
          value={form.names}
          onChange={(event) =>
            setForm({ ...form, names: event.target.value })
          }
          autoComplete="given-name"
          required
        />
        <Input
          label="Apellidos"
          value={form.surnames}
          onChange={(event) =>
            setForm({ ...form, surnames: event.target.value })
          }
          autoComplete="family-name"
          required
        />
        <Input
          label="Celular"
          type="tel"
          value={form.mobile}
          onChange={(event) => setForm({ ...form, mobile: event.target.value })}
          leftIcon={<Smartphone className="h-4 w-4" />}
          autoComplete="tel"
          required
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">Dirección</p>
        <div className="space-y-3">
          <Select
            id="profile-department"
            label="Departamento"
            value={form.departmentCode}
            onChange={(event) =>
              setForm({
                ...form,
                departmentCode: event.target.value,
                provinceCode: "",
                districtCode: "",
              })
            }
            required
          >
            <option value="">Selecciona un departamento</option>
            {PERU_DEPARTMENTS.map((department) => (
              <option key={department.code} value={department.code}>
                {department.name}
              </option>
            ))}
          </Select>
          <Select
            id="profile-province"
            label="Provincia"
            value={form.provinceCode}
            onChange={(event) =>
              setForm({
                ...form,
                provinceCode: event.target.value,
                districtCode: "",
              })
            }
            disabled={!form.departmentCode}
            required
          >
            <option value="">
              {form.departmentCode
                ? "Selecciona una provincia"
                : "Primero selecciona un departamento"}
            </option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </Select>
          <Select
            id="profile-district"
            label="Distrito"
            value={form.districtCode}
            onChange={(event) =>
              setForm({ ...form, districtCode: event.target.value })
            }
            disabled={!form.provinceCode}
            required
          >
            <option value="">
              {form.provinceCode
                ? "Selecciona un distrito"
                : "Primero selecciona una provincia"}
            </option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </Select>
          <Input
            label="Calle y número"
            value={form.street}
            onChange={(event) =>
              setForm({ ...form, street: event.target.value })
            }
            autoComplete="street-address"
            required
          />
          <Input
            label="Referencia para ubicar su vivienda fácilmente"
            value={form.reference}
            onChange={(event) =>
              setForm({ ...form, reference: event.target.value })
            }
            required
          />
        </div>
      </div>

      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        Guardar cambios
      </Button>
    </form>
  );
}
