"use client";

import Image from "next/image";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { PERU_PICKUP_DEPARTMENTS } from "@/lib/peru-ubigeo";
import peruMap from "@resources/Mapa_Peru.png";

interface PeruDepartmentMapProps {
  value: string;
  onChange: (departmentCode: string) => void;
}

interface DepartmentMarker {
  abbreviation: string;
  x: number;
  y: number;
}

const DEPARTMENT_MARKERS: Record<string, DepartmentMarker> = {
  "01": { abbreviation: "AM", x: 29.5, y: 31 },
  "02": { abbreviation: "AN", x: 32.5, y: 59.4 },
  "03": { abbreviation: "AP", x: 61, y: 76 },
  "04": { abbreviation: "AR", x: 57, y: 86.3 },
  "05": { abbreviation: "AY", x: 51, y: 77 },
  "06": { abbreviation: "CA", x: 26, y: 38.7 },
  "08": { abbreviation: "CU", x: 66.5, y: 66.7 },
  "09": { abbreviation: "HV", x: 45, y: 71.7 },
  "10": { abbreviation: "HU", x: 43.5, y: 53.8 },
  "11": { abbreviation: "IC", x: 38, y: 77.3 },
  "12": { abbreviation: "JU", x: 50, y: 64.8 },
  "13": { abbreviation: "LL", x: 28.5, y: 50.2 },
  "14": { abbreviation: "LA", x: 21.5, y: 44.5 },
  "15": { abbreviation: "LI", x: 34.7, y: 66.3 },
  "16": { abbreviation: "LO", x: 55, y: 26 },
  "17": { abbreviation: "MD", x: 78, y: 68 },
  "18": { abbreviation: "MO", x: 68, y: 91.6 },
  "19": { abbreviation: "PA", x: 43, y: 59.6 },
  "20": { abbreviation: "PI", x: 15.5, y: 37.7 },
  "21": { abbreviation: "PU", x: 78, y: 81.5 },
  "22": { abbreviation: "SM", x: 38, y: 43.2 },
  "23": { abbreviation: "TA", x: 75, y: 95 },
  "24": { abbreviation: "TU", x: 14, y: 29.5 },
  "25": { abbreviation: "UC", x: 59, y: 50.8 },
};

export default function PeruDepartmentMap({
  value,
  onChange,
}: PeruDepartmentMapProps) {
  const selectedDepartment = PERU_PICKUP_DEPARTMENTS.find(
    (department) => department.code === value
  );

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4">
      <div className="mx-auto w-full max-w-[420px]">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/25"
          role="radiogroup"
          aria-label="Departamentos del Perú"
        >
          <Image
            src={peruMap}
            alt="Mapa político del Perú dividido por departamentos"
            fill
            sizes="(max-width: 479px) calc(100vw - 64px), 420px"
            className="object-cover object-top"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-slate-950/5 via-transparent to-slate-950/20"
          />

          {PERU_PICKUP_DEPARTMENTS.map((department) => {
            const marker = DEPARTMENT_MARKERS[department.code];
            if (!marker) return null;
            const selected = department.code === value;

            return (
              <button
                key={department.code}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Seleccionar ${department.name}`}
                title={department.name}
                onClick={() => onChange(department.code)}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className={cn(
                  "absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[8px] font-bold shadow-lg transition hover:z-20 hover:scale-125 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:h-8 sm:w-8 sm:text-[9px]",
                  selected
                    ? "border-blue-300 bg-[#2563EB] text-white ring-4 ring-blue-500/25"
                    : "border-white/70 bg-slate-950/85 text-white hover:border-blue-300 hover:bg-blue-600"
                )}
              >
                {marker.abbreviation}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <Select
          id="pickup-department"
          label="Departamento para recojo"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Selecciona en el mapa o en esta lista</option>
          {PERU_PICKUP_DEPARTMENTS.map((department) => (
            <option key={department.code} value={department.code}>
              {department.name}
            </option>
          ))}
        </Select>
        <p className="mt-2 min-h-5 text-center text-sm text-slate-400" aria-live="polite">
          {selectedDepartment
            ? `Departamento seleccionado: ${selectedDepartment.name}`
            : "Toca un marcador para elegir un departamento"}
        </p>
      </div>
    </div>
  );
}
