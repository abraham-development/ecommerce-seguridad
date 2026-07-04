import Badge from "@/components/ui/Badge";
import { query } from "@/lib/db";
import type { Profile } from "@/types";

export default async function AdminUsuariosPage() {
  let profiles: Profile[] = [];

  try {
    profiles = await query<Profile>(
      "SELECT * FROM profiles ORDER BY created_at DESC"
    );
  } catch {
    profiles = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Usuarios</h1>

      {profiles.length === 0 ? (
        <div className="bg-[#1E293B] rounded-xl p-12 border border-slate-700 text-center text-slate-400">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full">
            <thead className="bg-[#1E293B] border-b border-slate-700">
              <tr>
                {["Nombre", "Teléfono", "Rol", "Registro"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-[#0F172A]">
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-[#1E293B]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">
                    {profile.full_name ?? profile.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {profile.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={profile.role === "admin" ? "primary" : "ghost"}
                    >
                      {profile.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(profile.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
