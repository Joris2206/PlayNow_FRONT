import {
  extractDrfErrorMessage,
  extractDrfFieldError,
  getApiErrorMessage,
} from "@/lib/api-error";
import { HttpError } from "@/lib/http";

export function getEmployeeApiFieldError(
  error: unknown,
  field: string
) {
  return error instanceof HttpError
    ? extractDrfFieldError(error.data, field)
    : null;
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
      extractDrfErrorMessage(error.data) ??
      "La operación no es posible en el estado actual del empleado."
    );
  }

  return getApiErrorMessage(error, fallback);
}

export function isValidOptionalEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
