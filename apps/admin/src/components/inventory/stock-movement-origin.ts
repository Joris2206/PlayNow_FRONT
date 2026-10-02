import type { StockMovementOriginType } from "@/types/stock-movement";

type StockMovementOriginCopy = {
  title: string;
  description: string;
};

const UNKNOWN_ORIGIN: StockMovementOriginCopy = {
  title: "Origen no identificado",
  description: "No fue posible determinar el origen de este movimiento.",
};

const FALLBACK_ORIGIN: StockMovementOriginCopy = {
  title: "Movimiento de inventario",
  description: "No fue posible determinar el origen de este movimiento.",
};

export function getStockMovementOriginCopy(
  originType: StockMovementOriginType,
  isReversal: boolean | null
): StockMovementOriginCopy {
  if (originType === "sale" && isReversal === false) {
    return {
      title: "Venta",
      description: "Generado automáticamente por una venta.",
    };
  }

  if (originType === "purchase" && isReversal === false) {
    return {
      title: "Compra",
      description: "Generado automáticamente por una compra.",
    };
  }

  if (originType === "sale" && isReversal === true) {
    return {
      title: "Anulación de venta",
      description: "Movimiento generado al anular una venta.",
    };
  }

  if (originType === "purchase" && isReversal === true) {
    return {
      title: "Anulación de compra",
      description: "Movimiento generado al anular una compra.",
    };
  }

  if (originType === "adjustment" && isReversal === null) {
    return {
      title: "Ajuste de inventario",
      description: "Movimiento de ajuste de inventario.",
    };
  }

  if (originType === "unknown" && isReversal === null) {
    return UNKNOWN_ORIGIN;
  }

  return FALLBACK_ORIGIN;
}
