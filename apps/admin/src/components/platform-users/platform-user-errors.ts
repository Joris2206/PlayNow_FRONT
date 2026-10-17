import {
  extractDrfFieldError,
  getApiErrorMessage,
} from "@/lib/api-error";
import { HttpError } from "@/lib/http";

export function getPlatformUserFieldError(error: unknown, field: string) {
  return error instanceof HttpError
    ? extractDrfFieldError(error.data, field)
    : null;
}

export function getPlatformUserError(error: unknown, fallback: string) {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.status === 400) {
    return getApiErrorMessage(error, "Los datos enviados no son válidos.");
  }
  if (error.status === 401) {
    return "Tu sesión ya no es válida. Vuelve a iniciar sesión.";
  }
  if (error.status === 403) {
    return "Tu cuenta ya no tiene autorización de Platform Admin.";
  }
  if (error.status === 404) {
    return "El usuario ya no está disponible.";
  }
  if (error.status === 409) {
    return getApiErrorMessage(
      error,
      "La operación entra en conflicto con el estado actual del usuario."
    );
  }
  if (error.status === 503) {
    return "La administración global está temporalmente ocupada. Conservamos los datos para que puedas reintentar.";
  }

  return getApiErrorMessage(error, fallback);
}
