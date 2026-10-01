import type { AuthError } from "@supabase/supabase-js";

export const SUPABASE_UNAVAILABLE_MESSAGE =
  "El servicio de cuentas no está disponible en este momento. Intentá nuevamente más tarde.";

const RETRYABLE_STATUSES = new Set([0, 502, 503, 504]);

/**
 * Supabase Auth logs rejected fetch promises directly to the browser console.
 * Convert transport failures into a regular HTTP response so callers can
 * handle the outage without triggering Next's development error overlay.
 */
export const supabaseFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch {
    return new Response(
      JSON.stringify({
        code: "supabase_unavailable",
        message: SUPABASE_UNAVAILABLE_MESSAGE,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export function isSupabaseNetworkError(error: AuthError): boolean {
  return (
    error.name === "AuthRetryableFetchError" ||
    (typeof error.status === "number" &&
      RETRYABLE_STATUSES.has(error.status)) ||
    /failed to fetch|network request failed|load failed/i.test(error.message)
  );
}

export function getAuthErrorMessage(
  error: AuthError,
  fallback = "No pudimos completar la operación. Intentá nuevamente."
): string {
  if (isSupabaseNetworkError(error)) {
    return SUPABASE_UNAVAILABLE_MESSAGE;
  }

  return fallback;
}
