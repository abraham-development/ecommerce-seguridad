"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface RegisterFormProps {
  onSuccess: (user: SupabaseUser) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("¡Cuenta creada! Continuando con tu compra...");
    if (data.user) onSuccess(data.user);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        type="text"
        id="reg-name"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        leftIcon={<User className="h-4 w-4" />}
        placeholder="Juan Pérez"
        required
      />
      <Input
        label="Email"
        type="email"
        id="reg-email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        leftIcon={<Mail className="h-4 w-4" />}
        placeholder="tu@email.com"
        required
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contraseña"
          type="password"
          id="reg-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Mínimo 6 caracteres"
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          id="reg-confirm"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Repetí tu contraseña"
          required
        />
      </div>
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Crear cuenta y continuar
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="text-center text-xs text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#2563EB] hover:underline font-medium"
        >
          Iniciá sesión
        </button>
      </p>
    </form>
  );
}
