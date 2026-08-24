import { HttpError } from "@/lib/http";

function firstString(value: unknown): string | null {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstString(item);
      if (message) return message;
    }
  }

  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const message = firstString(item);
      if (message) return message;
    }
  }

  return null;
}

export function getEmployeeApiFieldError(
  error: unknown,
  field: string
) {
  if (
    !(error instanceof HttpError) ||
    typeof error.data !== "object" ||
    error.data === null ||
    !(field in error.data)
  ) {
    return null;
  }

  const value = (error.data as Record<string, unknown>)[field];

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

export function getEmployeeErrorMessage(
  error: unknown,
  fallback: string
) {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (error.status === 404) {
    return "El empleado no existe o no está disponible en este negocio.";
  }

  if (error.status === 409) {
    return (
      firstString(error.data) ??
      "La operación no es posible en el estado actual del empleado."
    );
  }

  return firstString(error.data) ?? error.message ?? fallback;
}

export function isValidOptionalEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
