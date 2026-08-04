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
    <div className="rounded-xl bg-[#1E293B] p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Especificaciones Técnicas
      </h3>
      <table className="w-full">
        <tbody className="divide-y divide-slate-700/50">
          {entries.map(([key, value]) => (
            <tr key={key} className="group">
              <td className="w-1/2 py-2.5 pr-3 align-top text-xs font-medium text-slate-400 sm:w-2/5 sm:pr-4 sm:text-sm">
                {specLabels[key] ?? key}
              </td>
              <td className="break-words py-2.5 text-xs text-white sm:text-sm">
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
