import { redirect } from "next/navigation";
import { User } from "lucide-react";
import ProfileForm from "@/components/account/ProfileForm";
import { getCurrentAccount } from "@/lib/supabase/data";

export default async function PerfilPage() {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/login?redirect=/cuenta/perfil");
  }

  if (!account.profile) {
    redirect("/cuenta");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
          <User className="h-5 w-5 text-[#2563EB]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Editar perfil</h1>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
        <ProfileForm profile={account.profile} />
      </div>
    </div>
  );
}
