"use client";

import { useRef } from "react";
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
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, OTP_LENGTH - 1));
    const input = inputs.current[nextIndex];
    input?.focus();
    input?.select();
  };

  const commit = (next: string, focusIndex: number) => {
    const normalized = normalizeOtp(next);
    onChange(normalized);
    window.requestAnimationFrame(() => {
      focusAt(Math.min(focusIndex, Math.max(normalized.length, 0)));
    });
  };

  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => value[index] ?? ""
  );

  return (
    <div>
      <p
        id={`${id}-label`}
        className="mb-2 text-sm font-medium text-slate-300"
      >
        Código de verificación
      </p>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className="grid grid-cols-8 gap-1.5 sm:gap-2"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            id={index === 0 ? id : `${id}-${index}`}
            value={digit}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            enterKeyHint={index === OTP_LENGTH - 1 ? "done" : "next"}
            aria-label={`Dígito ${index + 1} de ${OTP_LENGTH}`}
            aria-describedby={`${id}-hint`}
            disabled={disabled}
            className="h-11 w-full min-w-0 rounded-lg border border-slate-600 bg-[#0F172A] text-center text-base font-semibold text-white outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-lg"
            onChange={(event) => {
              const raw = event.target.value.replace(/\D/g, "");
              if (!raw) return;

              if (raw.length > 1 || index > value.length) {
                const normalized = normalizeOtp(`${value.slice(0, index)}${raw}`);
                onChange(normalized);
                window.requestAnimationFrame(() => {
                  focusAt(Math.min(normalized.length, OTP_LENGTH - 1));
                });
                return;
              }

              const next =
                value.slice(0, index) + raw + value.slice(index + 1);
              const normalized = normalizeOtp(next);
              onChange(normalized);
              if (index < OTP_LENGTH - 1) {
                window.requestAnimationFrame(() => focusAt(index + 1));
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                event.preventDefault();
                if (value[index]) {
                  commit(
                    value.slice(0, index) + value.slice(index + 1),
                    index
                  );
                  return;
                }
                if (index > 0) {
                  commit(
                    value.slice(0, index - 1) + value.slice(index),
                    index - 1
                  );
                }
                return;
              }

              if (event.key === "ArrowLeft" && index > 0) {
                event.preventDefault();
                focusAt(index - 1);
                return;
              }

              if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
                event.preventDefault();
                focusAt(index + 1);
                return;
              }

              if (
                event.key.length === 1 &&
                !/\d/.test(event.key) &&
                !event.ctrlKey &&
                !event.metaKey
              ) {
                event.preventDefault();
              }
            }}
            onFocus={(event) => event.currentTarget.select()}
            onPaste={(event) => {
              event.preventDefault();
              const pasted = event.clipboardData.getData("text");
              const normalized = normalizeOtp(
                `${value.slice(0, index)}${pasted}`
              );
              onChange(normalized);
              window.requestAnimationFrame(() => {
                focusAt(Math.min(normalized.length, OTP_LENGTH - 1));
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
