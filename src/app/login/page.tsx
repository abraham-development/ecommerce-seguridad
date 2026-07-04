"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, LogIn } from "lucide-react";
import {
  getSafeRedirectPath,
  USER_DASHBOARD_PATH,
} from "@/lib/auth-routing";

const loginErrors: Record<string, string> = {
  session_required: "Necesitás iniciar sesión para acceder al panel admin.",
  admin_required: "Tu cuenta no tiene permisos de administrador.",
  auth_callback_failed: "No se pudo completar el inicio de sesión. Intentá de nuevo.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = getSafeRedirectPath(searchParams.get("redirect"));
  const callbackUrl = redirect ?? USER_DASHBOARD_PATH;
  const errorMessage = loginErrors[searchParams.get("error") ?? ""];
  const signInUrl = `/api/auth/signin/entra-external-id?callbackUrl=${encodeURIComponent(
    callbackUrl
  )}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-[#2563EB]" />
            <span className="text-xl font-bold text-white">AFCR Seguridad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-slate-400 text-sm mt-1">
            Accedé con Microsoft Entra External ID
          </p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-8 border border-slate-700">
          {errorMessage ? (
            <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {errorMessage}
            </div>
          ) : null}

          <Link
            href={signInUrl}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            Continuar con Entra
          </Link>

          <p className="text-center text-sm text-slate-400 mt-6">
            Si todavía no tenés cuenta, Entra te guiará durante el acceso.
          </p>
        </div>
      </div>
    </div>
  );
}
