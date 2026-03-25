export async function withMockFallback<T>(
  supabaseQuery: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await supabaseQuery();
  } catch {
    return fallback;
  }
}
