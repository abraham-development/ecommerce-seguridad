"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, MailCheck, RotateCw, Shield } from "lucide-react";
import toast from "react-hot-toast";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import {
  AUTH_STORAGE_KEYS,
  formatOtpExpiry,
  getEmailSendErrorMessage,
  getOtpErrorMessage,
  getRemainingCooldown,
  normalizeEmail,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
} from "@/lib/auth-email";
import { getSafeRedirectPath, USER_DASHBOARD_PATH } from "@/lib/auth-routing";
import { createClient } from "@/lib/supabase/client";

export default function VerificarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPath = getSafeRedirectPath(searchParams.get("next"));
  const nextPath = requestedPath ?? USER_DASHBOARD_PATH;

  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [otp, setOtp] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const allowManualEmail = searchParams.get("codigo") === "1";

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem(
      AUTH_STORAGE_KEYS.pendingVerificationEmail
    );

    if (!pendingEmail && !allowManualEmail) {
      router.replace("/registro");
      return;
    }

    const sentAt = Number(
      sessionStorage.getItem(AUTH_STORAGE_KEYS.verificationSentAt) ?? 0
    );

    if (pendingEmail) {
      setEmail(pendingEmail);
      setEmailLocked(true);
    }
    if (sentAt) setCooldown(getRemainingCooldown(sentAt));
    setReady(true);
  }, [allowManualEmail, router]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      toast.error("Ingresá el correo con el que creaste tu cuenta.");
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      toast.error(`Ingresá los ${OTP_LENGTH} dígitos del código.`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otp,
      type: "signup",
    });

    if (error) {
      toast.error(getOtpErrorMessage(error));
      setLoading(false);
      return;
    }

    sessionStorage.removeItem(AUTH_STORAGE_KEYS.pendingVerificationEmail);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.verificationSentAt);
    toast.success("¡Correo verificado correctamente!");

    const params = new URLSearchParams({ next: nextPath });
    router.replace(`/api/auth/role-redirect?${params.toString()}`);
    router.refresh();
  };

  const handleResend = async () => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      toast.error("Ingresá el correo con el que creaste tu cuenta.");
      return;
    }

    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
    });

    if (error) {
      toast.error(getEmailSendErrorMessage(error));
      setResending(false);
      return;
    }

    const sentAt = Date.now();
    sessionStorage.setItem(
      AUTH_STORAGE_KEYS.pendingVerificationEmail,
      normalizedEmail
    );
    sessionStorage.setItem(
      AUTH_STORAGE_KEYS.verificationSentAt,
      String(sentAt)
    );
    setOtp("");
    setCooldown(OTP_RESEND_SECONDS);
    setResending(false);
    toast.success("Te enviamos un código nuevo.");
  };

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-[#2563EB]" />
            <span className="text-xl font-bold text-white">AFCR Seguridad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Verificá tu correo</h1>
          <p className="mt-2 text-sm text-slate-400">
            Escribí el código de {OTP_LENGTH} dígitos que enviamos
            {emailLocked ? (
              <>
                {" "}
                a <span className="font-medium text-slate-200">{email}</span>
              </>
            ) : (
              " a tu email"
            )}
            . Tiene una vigencia de {formatOtpExpiry()}.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#1E293B] p-4 min-[380px]:p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4">
            <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
            <p className="text-sm leading-6 text-slate-300">
              Revisá también las carpetas de spam o promociones si no encontrás
              el mensaje.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {!emailLocked && (
              <Input
                id="verification-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="tu@email.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            )}
            <div>
              <OtpCodeInput
                id="signup-otp"
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />
              <p id="signup-otp-hint" className="mt-2 text-xs text-slate-500">
                Podés pegar el código completo. El cursor salta solo a la
                siguiente casilla.
              </p>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Verificar y continuar
            </Button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0 || loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-medium text-[#60A5FA] transition-colors hover:text-blue-300 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              <RotateCw
                className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
              />
              {cooldown > 0 ? `Reenviar en ${cooldown} s` : "Reenviar código"}
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-slate-400">
            ¿Usaste otro correo?{" "}
            <Link href="/registro" className="text-[#60A5FA] hover:underline">
              Volver al registro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
