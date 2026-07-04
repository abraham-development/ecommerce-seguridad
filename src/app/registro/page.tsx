"use client";

import Link from "next/link";
import { Shield, UserPlus } from "lucide-react";

export default function RegistroPage() {
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
            El registro se completa con Microsoft Entra External ID
          </p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-8 border border-slate-700">
          <Link
            href="/api/auth/signin/entra-external-id?callbackUrl=/cuenta"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Continuar con Entra
          </Link>

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
