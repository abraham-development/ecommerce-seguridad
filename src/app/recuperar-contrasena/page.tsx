"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Lock, Mail, RotateCw, Shield } from "lucide-react";
import toast from "react-hot-toast";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  AUTH_STORAGE_KEYS,
  getEmailSendErrorMessage,
  getOtpErrorMessage,
  getPasswordErrorMessage,
  getRemainingCooldown,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
} from "@/lib/auth-email";
import { getSafeRedirectPath } from "@/lib/auth-routing";
import { createClient } from "@/lib/supabase/client";

type RecoveryStep = "email" | "otp" | "password";

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeRedirectPath(searchParams.get("next"));

  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const restoreRecovery = window.setTimeout(() => {
      const recoveryEmail = sessionStorage.getItem(
        AUTH_STORAGE_KEYS.recoveryEmail
      );
      const recoveryVerified = sessionStorage.getItem(
        AUTH_STORAGE_KEYS.recoveryVerified
      );
      const sentAt = Number(
        sessionStorage.getItem(AUTH_STORAGE_KEYS.recoverySentAt) ?? 0
      );

      if (recoveryEmail) {
        setEmail(recoveryEmail);
        setStep(recoveryVerified === "true" ? "password" : "otp");
      }
      if (sentAt) setCooldown(getRemainingCooldown(sentAt));
    }, 0);

    return () => window.clearTimeout(restoreRecovery);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendRecoveryCode = async (normalizedEmail: string): Promise<boolean> => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);

    if (error) {
      toast.error(getEmailSendErrorMessage(error));
      return false;
    }

    const sentAt = Date.now();
    sessionStorage.setItem(AUTH_STORAGE_KEYS.recoveryEmail, normalizedEmail);
    sessionStorage.setItem(AUTH_STORAGE_KEYS.recoverySentAt, String(sentAt));
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.recoveryVerified);
    setEmail(normalizedEmail);
    setCooldown(OTP_RESEND_SECONDS);
    return true;
  };

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const sent = await sendRecoveryCode(normalizeEmail(email));
    setLoading(false);

    if (sent) {
      setStep("otp");
      toast.success(
        "Si existe una cuenta con ese correo, recibirás un código de recuperación."
      );
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Ingresá los ${OTP_LENGTH} dígitos del código.`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: otp,
      type: "recovery",
    });

    if (error) {
      toast.error(getOtpErrorMessage(error));
      setLoading(false);
      return;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEYS.recoveryVerified, "true");
    setLoading(false);
    setStep("password");
    toast.success("Código verificado. Elegí una contraseña nueva.");
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(getPasswordErrorMessage(error));
      setLoading(false);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "global",
    });
    if (signOutError) {
      await supabase.auth.signOut({ scope: "local" });
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.recoveryEmail);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.recoverySentAt);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.recoveryVerified);
    toast.success("Contraseña actualizada. Iniciá sesión con tu nueva contraseña.");

    const loginParams = new URLSearchParams();
    if (nextPath) loginParams.set("redirect", nextPath);
    const loginUrl = loginParams.size > 0 ? `/login?${loginParams}` : "/login";
    router.replace(loginUrl);
    router.refresh();
  };

  const handleResend = async () => {
    setResending(true);
    const sent = await sendRecoveryCode(normalizeEmail(email));
    setResending(false);

    if (sent) {
      setOtp("");
      toast.success("Te enviamos un código nuevo.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-[#2563EB]" />
            <span className="text-xl font-bold text-white">AFCR Seguridad</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {step === "email" && "Te enviaremos un código para validar tu identidad."}
            {step === "otp" &&
              `Ingresá el código recibido. Vence en ${OTP_EXPIRY_MINUTES} minutos.`}
            {step === "password" && "Creá una contraseña nueva para tu cuenta."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#1E293B] p-4 min-[380px]:p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2" aria-label="Progreso">
            {["Email", "Código", "Contraseña"].map((label, index) => {
              const activeIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;
              const active = index <= activeIndex;
              return (
                <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active
                        ? "bg-[#2563EB] text-white"
                        : "border border-slate-600 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {index < 2 ? (
                    <span className={`h-px flex-1 ${activeIndex > index ? "bg-[#2563EB]" : "bg-slate-700"}`} />
                  ) : null}
                </div>
              );
            })}
          </div>

          {step === "email" ? (
            <form onSubmit={handleRequest} className="space-y-5">
              <Input
                id="recovery-email"
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
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Enviar código
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="rounded-lg bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
                Código enviado a <strong className="break-all text-white">{email}</strong>
              </div>
              <div>
                <OtpCodeInput
                  id="recovery-otp"
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                />
                <p id="recovery-otp-hint" className="mt-2 text-xs text-slate-500">
                  Podés pegar el código completo recibido por correo.
                </p>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Verificar código
              </Button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0 || loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 text-sm font-medium text-[#60A5FA] hover:text-blue-300 disabled:cursor-not-allowed disabled:text-slate-500"
              >
                <RotateCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                {cooldown > 0 ? `Reenviar en ${cooldown} s` : "Reenviar código"}
              </button>
            </form>
          ) : null}

          {step === "password" ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <Input
                id="new-password"
                label="Nueva contraseña"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                disabled={loading}
              />
              <Input
                id="confirm-new-password"
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                leftIcon={<KeyRound className="h-4 w-4" />}
                placeholder="Repetí tu nueva contraseña"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                disabled={loading}
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Guardar nueva contraseña
              </Button>
            </form>
          ) : null}

          <Link
            href={nextPath ? `/login?redirect=${encodeURIComponent(nextPath)}` : "/login"}
            className="mt-6 flex min-h-11 items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
