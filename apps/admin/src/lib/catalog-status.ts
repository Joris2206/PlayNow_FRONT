export type CatalogStatusTone =
  | "active"
  | "inactive"
  | "destructive"
  | "neutral";

const DESTRUCTIVE_STATUS_NAMES = new Set([
  "eliminado",
  "anulado",
  "cancelado",
  "deleted",
  "void",
]);

export function normalizeStatusName(
  statusName: string
) {
  return statusName.trim().toLocaleLowerCase();
}

export function findStatusByName<
  TStatus extends { name: string },
>(
  statuses: readonly TStatus[],
  name: string
) {
  const normalizedName = normalizeStatusName(name);

  return statuses.find(
    (status) =>
      normalizeStatusName(status.name) ===
      normalizedName
  );
}

export function isActiveCatalogStatus(
  statusName: string
) {
  return normalizeStatusName(statusName) === "activo";
}

export function isRecoverableProductStatus(
  statusName: string
) {
  const normalizedStatus =
    normalizeStatusName(statusName);

  return [
    "inactivo",
    "eliminado",
    "anulado",
    "cancelado",
  ].includes(normalizedStatus);
}

export function getCatalogStatusTone(
  statusName: string
): CatalogStatusTone {
  const normalizedStatus =
    normalizeStatusName(statusName);

  if (normalizedStatus === "activo") {
    return "active";
  }

  if (normalizedStatus === "inactivo") {
    return "inactive";
  }

  if (
    DESTRUCTIVE_STATUS_NAMES.has(normalizedStatus)
  ) {
    return "destructive";
  }

  return "neutral";
}

export function isTerminalCatalogStatus(
  statusName: string
) {
  return (
    getCatalogStatusTone(statusName) ===
    "destructive"
  );
}

export function getCatalogStatusClassName(
  statusName: string
) {
  const tone = getCatalogStatusTone(statusName);

  if (tone === "active") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (tone === "inactive") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  if (tone === "destructive") {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}
