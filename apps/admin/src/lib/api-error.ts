const PRIORITY_FIELDS = ["detail", "non_field_errors"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the first useful message from a DRF error payload.
 * Priority is detail, then non_field_errors, then the first field/nested value.
 */
export function extractDrfErrorMessage(payload: unknown): string | null {
  if (typeof payload === "string") {
    const message = payload.trim();
    return message || null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const message = extractDrfErrorMessage(item);
      if (message) return message;
    }

    return null;
  }

  if (!isRecord(payload)) return null;

  for (const field of PRIORITY_FIELDS) {
    const message = extractDrfErrorMessage(payload[field]);
    if (message) return message;
  }

  for (const [field, value] of Object.entries(payload)) {
    if (PRIORITY_FIELDS.includes(field as (typeof PRIORITY_FIELDS)[number])) {
      continue;
    }

    const message = extractDrfErrorMessage(value);
    if (message) return message;
  }

  return null;
}

export function extractDrfFieldError(
  payload: unknown,
  field: string
): string | null {
  if (!isRecord(payload) || !(field in payload)) return null;
  return extractDrfErrorMessage(payload[field]);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isRecord(error) && "data" in error) {
    const message = extractDrfErrorMessage(error.data);
    if (message) return message;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message) return message;
  }

  return fallback;
}
