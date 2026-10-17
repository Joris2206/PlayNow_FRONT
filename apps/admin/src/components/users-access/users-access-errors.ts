import {
  extractDrfFieldError,
  getApiErrorMessage,
} from "@/lib/api-error";
import { HttpError } from "@/lib/http";

export function getUsersAccessFieldError(
  error: unknown,
  field: string
) {
  return error instanceof HttpError
    ? extractDrfFieldError(error.data, field)
    : null;
}

export function getUsersAccessMutationError(
  error: unknown,
  fallback: string
) {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.status === 403) {
    return getApiErrorMessage(
      error,
      "No tienes permisos para realizar esta acción."
    );
  }

  if (error.status === 404) {
    return getApiErrorMessage(
      error,
      "El negocio o la membership ya no está disponible."
    );
  }

  if (error.status === 409) {
    return getApiErrorMessage(
      error,
      "La operación entra en conflicto con el estado actual del acceso."
    );
  }

  if (error.status === 503) {
    return getApiErrorMessage(
      error,
      "La operación está temporalmente ocupada. Conservamos el formulario para que puedas reintentar."
    );
  }

  return getApiErrorMessage(error, fallback);
}
