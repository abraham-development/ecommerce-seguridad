import type { ProductSpecs } from "@/types";

interface ProductSpecsProps {
  specs: ProductSpecs;
}

const specLabels: Record<string, string> = {
  resolution: "Resolución",
  night_vision: "Visión nocturna",
  ip_rating: "Clasificación IP",
  connectivity: "Conectividad",
  storage: "Almacenamiento",
  fov: "Campo de visión",
  zoom: "Zoom",
  channels: "Canales",
  compression: "Compresión",
  frame_rate: "Frame rate",
  audio: "Audio",
  poe: "PoE",
  ir_distance: "Distancia IR",
  lens: "Lente",
  power: "Alimentación",
  dimensions: "Dimensiones",
  weight: "Peso",
};

export default function ProductSpecs({ specs }: ProductSpecsProps) {
  const entries = Object.entries(specs).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );

  if (entries.length === 0) return null;

  return (
    <div className="bg-[#1E293B] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Especificaciones Técnicas
      </h3>
      <table className="w-full">
        <tbody className="divide-y divide-slate-700/50">
          {entries.map(([key, value]) => (
            <tr key={key} className="group">
              <td className="py-2.5 pr-4 text-sm text-slate-400 font-medium w-2/5">
                {specLabels[key] ?? key}
              </td>
              <td className="py-2.5 text-sm text-white">
                {typeof value === "boolean"
                  ? value
                    ? "Sí"
                    : "No"
                  : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
