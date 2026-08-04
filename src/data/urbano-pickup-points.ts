export interface UrbanoPickupPoint {
  id: string;
  name: string;
  departmentCode: string;
  districtCode: string;
  address: string;
  reference: string;
  schedule?: string;
}

// Los puntos se añadirán aquí cuando Urbano entregue el listado oficial.
// No se deben inventar agencias: el checkout solo habilita la continuación
// cuando el punto seleccionado existe en este catálogo.
export const URBANO_PICKUP_POINTS: readonly UrbanoPickupPoint[] = [];

export function getUrbanoPickupPoints(
  departmentCode: string
): UrbanoPickupPoint[] {
  return URBANO_PICKUP_POINTS.filter(
    (point) => point.departmentCode === departmentCode
  );
}

export function getUrbanoPickupPoint(
  pointId: string
): UrbanoPickupPoint | null {
  return URBANO_PICKUP_POINTS.find((point) => point.id === pointId) ?? null;
}
