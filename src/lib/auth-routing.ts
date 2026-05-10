import type { UserRole } from "@/types";

export const ADMIN_DASHBOARD_PATH = "/admin";
export const USER_DASHBOARD_PATH = "/cuenta";
const ADMIN_EMAILS = ["time45120@gmail.com"];

export function getSafeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function getLocalSafeOrigin(origin: string): string {
  try {
    const url = new URL(origin);

    if (url.hostname === "0.0.0.0") {
      url.hostname = "localhost";
    }

    return url.origin;
  } catch {
    return origin;
  }
}

export function getDashboardPathForRole(role: UserRole | null | undefined): string {
  return role === "admin" ? ADMIN_DASHBOARD_PATH : USER_DASHBOARD_PATH;
}

export function isAdminAccount(
  role: UserRole | string | null | undefined,
  email: string | null | undefined
): boolean {
  return (
    role === "admin" ||
    (email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false)
  );
}

export function getPostLoginRedirect(
  role: UserRole | null | undefined,
  requestedPath: string | null
): string {
  if (!requestedPath || requestedPath === USER_DASHBOARD_PATH) {
    return getDashboardPathForRole(role);
  }

  if (requestedPath.startsWith(ADMIN_DASHBOARD_PATH) && role !== "admin") {
    return USER_DASHBOARD_PATH;
  }

  return requestedPath;
}
