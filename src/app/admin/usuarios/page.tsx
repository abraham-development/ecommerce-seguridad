import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";

export default async function AdminUsuariosPage() {
  let profiles: Record<string, unknown>[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    profiles = (data as Record<string, unknown>[]) ?? [];
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
              {profiles.map((p) => (
                <tr key={p.id as string} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">
                    {(p.full_name as string) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {(p.phone as string) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={p.role === "admin" ? "primary" : "ghost"}
                    >
                      {p.role as string}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(p.created_at as string).toLocaleDateString("es-AR")}
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
