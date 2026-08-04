import peruUbigeo from "@/data/peru-ubigeo.json";

export interface PeruLocationOption {
  code: string;
  name: string;
}

interface PeruProvince extends PeruLocationOption {
  departmentCode: string;
}

interface PeruDistrict extends PeruLocationOption {
  provinceCode: string;
}

export interface LimaMetropolitanaDistrict extends PeruDistrict {
  provinceName: "Callao" | "Lima";
}

export interface PeruLocation {
  department: PeruLocationOption;
  province: PeruProvince;
  district: PeruDistrict;
}

export const PERU_DEPARTMENTS: PeruLocationOption[] = peruUbigeo.departments;

export const PERU_PICKUP_DEPARTMENTS: PeruLocationOption[] =
  PERU_DEPARTMENTS.filter((department) => department.code !== "07");

export const LIMA_METROPOLITANA_PROVINCE_CODES = ["0701", "1501"] as const;

export function getPeruProvinces(departmentCode: string): PeruProvince[] {
  return peruUbigeo.provinces.filter(
    (province) => province.departmentCode === departmentCode
  );
}

export function getPeruDistricts(provinceCode: string): PeruDistrict[] {
  return peruUbigeo.districts.filter(
    (district) => district.provinceCode === provinceCode
  );
}

export function getLimaMetropolitanaDistricts(): LimaMetropolitanaDistrict[] {
  return LIMA_METROPOLITANA_PROVINCE_CODES.flatMap((provinceCode) => {
    const provinceName: LimaMetropolitanaDistrict["provinceName"] =
      provinceCode === "0701" ? "Callao" : "Lima";

    return getPeruDistricts(provinceCode).map((district) => ({
      ...district,
      provinceName,
    }));
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function isLimaMetropolitanaDistrict(ubigeo: string): boolean {
  return LIMA_METROPOLITANA_PROVINCE_CODES.some((provinceCode) =>
    ubigeo.startsWith(provinceCode)
  );
}

export function resolvePeruLocation(ubigeo: string): PeruLocation | null {
  const district = peruUbigeo.districts.find((item) => item.code === ubigeo);
  if (!district) return null;

  const province = peruUbigeo.provinces.find(
    (item) => item.code === district.provinceCode
  );
  if (!province) return null;

  const department = peruUbigeo.departments.find(
    (item) => item.code === province.departmentCode
  );
  if (!department) return null;

  return { department, province, district };
}
