"use client";

import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { PERU_PICKUP_DEPARTMENTS } from "@/lib/peru-ubigeo";

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
  "01": { abbreviation: "AM", x: 48, y: 15 },
  "02": { abbreviation: "AN", x: 35, y: 39 },
  "03": { abbreviation: "AP", x: 61, y: 65 },
  "04": { abbreviation: "AR", x: 58, y: 76 },
  "05": { abbreviation: "AY", x: 55, y: 62 },
  "06": { abbreviation: "CA", x: 36, y: 20 },
  "08": { abbreviation: "CU", x: 70, y: 62 },
  "09": { abbreviation: "HV", x: 49, y: 57 },
  "10": { abbreviation: "HU", x: 49, y: 41 },
  "11": { abbreviation: "IC", x: 42, y: 65 },
  "12": { abbreviation: "JU", x: 55, y: 50 },
  "13": { abbreviation: "LL", x: 31, y: 31 },
  "14": { abbreviation: "LA", x: 26, y: 23 },
  "15": { abbreviation: "LI", x: 39, y: 50 },
  "16": { abbreviation: "LO", x: 69, y: 22 },
  "17": { abbreviation: "MD", x: 81, y: 55 },
  "18": { abbreviation: "MO", x: 68, y: 84 },
  "19": { abbreviation: "PA", x: 55, y: 44 },
  "20": { abbreviation: "PI", x: 22, y: 14 },
  "21": { abbreviation: "PU", x: 78, y: 73 },
  "22": { abbreviation: "SM", x: 51, y: 29 },
  "23": { abbreviation: "TA", x: 72, y: 91 },
  "24": { abbreviation: "TU", x: 25, y: 7 },
  "25": { abbreviation: "UC", x: 68, y: 40 },
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
      <div className="mx-auto w-full max-w-[340px]">
        <div
          className="relative aspect-[18/28] w-full"
          role="radiogroup"
          aria-label="Departamentos del Perú"
        >
          <svg
            viewBox="0 0 360 560"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full drop-shadow-[0_18px_30px_rgba(37,99,235,0.16)]"
          >
            <path
              d="M86 18 130 29 151 57 197 75 248 68 296 95 314 131 296 166 307 204 288 238 293 272 270 306 277 343 253 376 243 415 221 447 207 491 184 535 155 524 144 489 119 463 105 429 82 398 74 355 57 323 68 286 55 251 70 217 57 181 74 148 61 111 80 78 72 43Z"
              className="fill-slate-800 stroke-slate-600"
              strokeWidth="3"
            />
            <path
              d="M79 79 151 57M74 148 197 75M57 181 248 68M70 217 296 95M55 251 296 166M68 286 307 204M57 323 288 238M74 355 293 272M82 398 270 306M105 429 277 343M119 463 253 376M144 489 243 415M155 524 221 447"
              className="stroke-slate-700"
              strokeWidth="1"
              opacity="0.65"
            />
          </svg>

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
                  "absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[8px] font-bold shadow-md transition hover:z-20 hover:scale-125 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:h-8 sm:w-8 sm:text-[9px]",
                  selected
                    ? "border-blue-300 bg-[#2563EB] text-white ring-4 ring-blue-500/25"
                    : "border-slate-500 bg-slate-900 text-slate-200 hover:border-blue-400 hover:bg-blue-600"
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
