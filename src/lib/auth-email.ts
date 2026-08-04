import type { AuthError } from "@supabase/supabase-js";

export const MIN_PASSWORD_LENGTH = 8;
export const OTP_LENGTH = 8;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_RESEND_SECONDS = 60;

export const AUTH_STORAGE_KEYS = {
  pendingVerificationEmail: "afcr-pending-verification-email",
  verificationSentAt: "afcr-verification-sent-at",
  recoveryEmail: "afcr-recovery-email",
  recoverySentAt: "afcr-recovery-sent-at",
  recoveryVerified: "afcr-recovery-verified",
} as const;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function getRemainingCooldown(sentAt: number): number {
  const elapsedSeconds = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, OTP_RESEND_SECONDS - elapsedSeconds);
}

export function getOtpErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "otp_expired":
      return "El código venció o no es válido. Solicitá uno nuevo.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Esperá un momento antes de solicitar otro código.";
    default:
      return "No pudimos verificar el código. Revisalo e intentá de nuevo.";
  }
}

export function getEmailSendErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Esperá un momento antes de solicitar otro código.";
    case "email_address_invalid":
      return "Ingresá una dirección de correo válida.";
    default:
      return "No pudimos enviar el código. Intentá nuevamente en unos minutos.";
  }
}

export function getPasswordErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "weak_password":
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    case "same_password":
      return "La nueva contraseña debe ser diferente de la anterior.";
    default:
      return "No pudimos actualizar la contraseña. Intentá nuevamente.";
  }
}
