export type PermissionRequirement = {
  module: string;
  action: string;
};

const ADMIN_MODULE_BY_SEGMENT: Record<string, string> = {
  announcements: "announcement",
  departments: "department",
  categories: "category",
  tags: "tag",
  users: "user",
  roles: "role",
  permissions: "permission",
  "audit-log": "audit",
};

const DOCUMENT_METADATA_ACCESS: PermissionRequirement[] = [
  { module: "department", action: "view" },
  { module: "category", action: "view" },
  { module: "confidential_level", action: "view" },
];

/**
 * Resolve the permissions required to view a route. Returns null when the route
 * is always available to an authenticated user (e.g. profile).
 *
 * All returned requirements must be satisfied (logical AND).
 */
export function getRouteRequirements(
  pathname: string,
): PermissionRequirement[] | null {
  if (
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/change-password"
  ) {
    return null;
  }

  if (pathname === "/documents/upload") {
    return [
      { module: "document", action: "upload" },
      ...DOCUMENT_METADATA_ACCESS,
    ];
  }

  if (pathname.startsWith("/documents/")) {
    if (pathname.endsWith("/edit")) {
      return [
        { module: "document", action: "view" },
        { module: "document", action: "update" },
        ...DOCUMENT_METADATA_ACCESS,
      ];
    }

    if (pathname.endsWith("/view")) {
      return [
        { module: "document", action: "view" },
        { module: "document_version", action: "view" },
        { module: "document_version", action: "download" },
      ];
    }

    return [{ module: "document", action: "view" }];
  }

  if (pathname === "/documents") {
    return [{ module: "document", action: "view" }];
  }

  if (pathname.startsWith("/public-library/admin")) {
    return [{ module: "document", action: "upload" }];
  }

  if (pathname.startsWith("/public-library")) {
    return [{ module: "document", action: "view" }];
  }

  if (
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/recently-opened")
  ) {
    return [{ module: "document", action: "view" }];
  }

  if (pathname.startsWith("/dashboard")) {
    return [{ module: "document", action: "view" }];
  }

  if (pathname.startsWith("/admin/settings")) {
    return null;
  }

  if (pathname.startsWith("/admin/")) {
    const segment = pathname.split("/")[2] ?? "";
    const module = ADMIN_MODULE_BY_SEGMENT[segment];

    if (!module) return null;

    if (segment === "permissions") {
      return [
        { module: "permission", action: "view" },
        { module: "role", action: "view" },
        { module: "role_permission", action: "view" },
      ];
    }

    if (segment === "users" && pathname.endsWith("/create")) {
      return [
        { module, action: "create" },
        { module: "role", action: "view" },
        { module: "department", action: "view" },
      ];
    }

    if (segment === "users" && pathname.endsWith("/edit")) {
      return [
        { module, action: "view" },
        { module, action: "update" },
        { module: "role", action: "view" },
        { module: "department", action: "view" },
      ];
    }

    if (segment === "announcements" && pathname.endsWith("/edit")) {
      return [
        { module, action: "update" },
        { module, action: "view" },
      ];
    }

    if (pathname.endsWith("/create") || pathname.endsWith("/new")) {
      return [{ module, action: "create" }];
    }

    if (pathname.endsWith("/edit")) {
      return [{ module, action: "update" }];
    }

    return [{ module, action: "view" }];
  }

  return null;
}

export function isRouteAllowed(
  pathname: string,
  has: (module: string, action: string) => boolean,
): boolean {
  const requirements = getRouteRequirements(pathname);
  if (!requirements) return true;
  return requirements.every((req) => has(req.module, req.action));
}
