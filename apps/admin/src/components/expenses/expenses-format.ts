import { formatSaleDate, formatSaleMoney } from "@/components/sales/sales-format";
import { extractDrfErrorMessage, getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";

const API_FIELD_LABELS: Record<string, string> = {
  business_public_id: "Negocio",
  payment_method_public_id: "Método de pago",
  payment_status: "Estado de pago",
  expense_amount: "Importe",
  concept: "Concepto",
  invoice_number: "Número de factura",
  invoice_series: "Serie de factura",
  initial_paid_amount: "Pago inicial",
  details: "Detalle",
  discount_percent: "Descuento",
  non_field_errors: "Validación",
};

export function getExpenseErrorMessage(
  error: unknown,
  fallback: string
) {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (typeof error.data === "object" && error.data !== null) {
    const data = error.data as Record<string, unknown>;
    const detail = extractDrfErrorMessage(data.detail);

    if (detail) {
      return detail;
    }

    for (const [field, value] of Object.entries(data)) {
      const message = extractDrfErrorMessage(value);

      if (message) {
        return `${API_FIELD_LABELS[field] ?? field}: ${message}`;
      }
    }
  }

  if (error.status === 403) {
    return "No tienes permisos para realizar esta operación con gastos.";
  }

  if (error.status === 404) {
    return "El gasto o uno de los recursos seleccionados ya no está disponible.";
  }

  if (error.status === 409) {
    return "El gasto cambió mientras realizabas la operación. Actualizamos la información disponible.";
  }

  return getApiErrorMessage(error, fallback);
}

export const formatExpenseDate = formatSaleDate;
export const formatExpenseMoney = formatSaleMoney;

export function formatExpenseInvoice(
  invoiceSeries: string | null,
  invoiceNumber: string | null
) {
  return [invoiceSeries, invoiceNumber]
    .filter(Boolean)
    .join(" · ");
}
