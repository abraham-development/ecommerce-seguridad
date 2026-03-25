"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface LoginFormProps {
  onSuccess: (user: SupabaseUser) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Credenciales incorrectas"
          : error.message
      );
      setLoading(false);
      return;
    }
    toast.success("¡Bienvenido de vuelta!");
    if (data.user) onSuccess(data.user);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        type="email"
        id="login-email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        leftIcon={<Mail className="h-4 w-4" />}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />
      <Input
        label="Contraseña"
        type="password"
        id="login-password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        leftIcon={<Lock className="h-4 w-4" />}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Ingresar y continuar
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="text-center text-xs text-slate-500">
        ¿No tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#2563EB] hover:underline font-medium"
        >
          Registrate gratis
        </button>
      </p>
    </form>
  );
}
