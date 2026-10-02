import { redirect } from "next/navigation";

interface VerificarEmailPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function VerificarEmailPage({
  searchParams,
}: VerificarEmailPageProps) {
  const params = await searchParams;
  const next = params.next?.trim();
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  redirect(`/verificar${query}`);
}
