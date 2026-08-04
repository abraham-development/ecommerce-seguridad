"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Smartphone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  AUTH_STORAGE_KEYS,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth-email";

interface RegisterFormProps {
  onSuccess: (user: SupabaseUser) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    names: "",
    surnames: "",
    mobile: "",
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
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      );
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const email = normalizeEmail(form.email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          names: form.names,
          surnames: form.surnames,
          mobile: form.mobile,
        },
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      toast.success("¡Cuenta creada! Continuando con tu compra...");
      onSuccess(data.user);
      return;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEYS.pendingVerificationEmail, email);
    sessionStorage.setItem(
      AUTH_STORAGE_KEYS.verificationSentAt,
      String(Date.now())
    );
    toast.success("Te enviamos un código para confirmar tu correo.");
    router.push("/verificar-email?next=/checkout");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nombres"
          type="text"
          id="reg-names"
          value={form.names}
          onChange={(e) => setForm({ ...form, names: e.target.value })}
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Juan Carlos"
          autoComplete="given-name"
          required
        />
        <Input
          label="Apellidos"
          type="text"
          id="reg-surnames"
          value={form.surnames}
          onChange={(e) => setForm({ ...form, surnames: e.target.value })}
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Pérez García"
          autoComplete="family-name"
          required
        />
      </div>
      <Input
        label="Celular"
        type="tel"
        id="reg-mobile"
        value={form.mobile}
        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        leftIcon={<Smartphone className="h-4 w-4" />}
        placeholder="+51 999 999 999"
        autoComplete="tel"
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
        autoComplete="email"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contraseña"
          type="password"
          id="reg-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
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
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
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
