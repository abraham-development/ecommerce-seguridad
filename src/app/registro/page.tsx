"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Shield, Smartphone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  AUTH_STORAGE_KEYS,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth-email";
import { getLocalSafeOrigin } from "@/lib/auth-routing";
import toast from "react-hot-toast";

export default function RegistroPage() {
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

    if (data.session) {
      toast.success("¡Cuenta creada correctamente!");
      router.push("/api/auth/role-redirect?next=/cuenta");
      router.refresh();
      return;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEYS.pendingVerificationEmail, email);
    sessionStorage.setItem(
      AUTH_STORAGE_KEYS.verificationSentAt,
      String(Date.now())
    );
    toast.success("Te enviamos un código para confirmar tu correo.");
    router.push("/verificar-email?next=/cuenta");
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getLocalSafeOrigin(window.location.origin)}/api/auth/callback?next=/cuenta`,
      },
    });

    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-[#2563EB]" />
            <span className="text-xl font-bold text-white">AFCR Seguridad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-1">
            Registrate para acceder a tu historial de pedidos
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#1E293B] p-4 min-[380px]:p-6 sm:p-8">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-colors text-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading
              ? "Conectando con Google..."
              : "Registrate con una cuenta de google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#1E293B] px-4 text-xs text-slate-500">
                o creá tu cuenta con email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombres"
              type="text"
              id="names"
              value={form.names}
              onChange={(e) =>
                setForm({ ...form, names: e.target.value })
              }
              leftIcon={<User className="h-4 w-4" />}
              placeholder="Juan Carlos"
              autoComplete="given-name"
              required
            />
            <Input
              label="Apellidos"
              type="text"
              id="surnames"
              value={form.surnames}
              onChange={(e) =>
                setForm({ ...form, surnames: e.target.value })
              }
              leftIcon={<User className="h-4 w-4" />}
              placeholder="Pérez García"
              autoComplete="family-name"
              required
            />
            <Input
              label="Celular"
              type="tel"
              id="mobile"
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
              id="email"
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
              id="password"
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
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              leftIcon={<Lock className="h-4 w-4" />}
              placeholder="Repetí tu contraseña"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-[#2563EB] hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
