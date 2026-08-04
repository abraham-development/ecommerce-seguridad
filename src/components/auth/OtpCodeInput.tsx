"use client";

import { KeyRound } from "lucide-react";
import Input from "@/components/ui/Input";
import { normalizeOtp, OTP_LENGTH } from "@/lib/auth-email";

interface OtpCodeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OtpCodeInput({
  id,
  value,
  onChange,
  disabled = false,
}: OtpCodeInputProps) {
  return (
    <Input
      id={id}
      label="Código de verificación"
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      enterKeyHint="done"
      value={value}
      onChange={(event) => onChange(normalizeOtp(event.target.value))}
      leftIcon={<KeyRound className="h-4 w-4" />}
      placeholder={"0".repeat(OTP_LENGTH)}
      minLength={OTP_LENGTH}
      maxLength={OTP_LENGTH}
      pattern={`[0-9]{${OTP_LENGTH}}`}
      disabled={disabled}
      required
      className="text-center text-lg font-semibold tracking-[0.35em]"
      aria-describedby={`${id}-hint`}
    />
  );
}
