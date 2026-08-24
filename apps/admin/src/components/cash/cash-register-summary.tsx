"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  LoaderCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { formatCashMoney } from "@/components/cash/cash-format";
import { Button } from "@/components/ui/button";

import type { CashRegisterClosingPreview } from "@/types/cash";

type CashRegisterSummaryProps = {
  preview?: CashRegisterClosingPreview;
  currency: string;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRefresh: () => void;
};

type SummaryItemProps = {
  label: string;
  value: string;
  currency: string;
};

function SummaryItem({
  label,
  value,
  currency,
}: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-200">
        {formatCashMoney(value, currency)}
      </dd>
    </div>
  );
}

export default function CashRegisterSummary({
  preview,
  currency,
  isLoading,
  isFetching,
  error,
  onRefresh,
}: CashRegisterSummaryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col items-center gap-3 text-sm text-zinc-500">
          <LoaderCircle className="h-6 w-6 animate-spin text-red-500" />
          Calculando saldo actual...
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm text-red-300">
          No fue posible obtener el resumen autoritativo de la caja.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          className="mt-4 border-white/10 bg-transparent text-white hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  const primaryCards = [
    {
      label: "Saldo esperado actual",
      value: preview.expected_closing_balance,
      icon: CircleDollarSign,
      tone: "text-white",
    },
    {
      label: "Saldo inicial",
      value: preview.opening_balance,
      icon: Wallet,
      tone: "text-zinc-200",
    },
    {
      label: "Entradas automáticas",
      value: preview.automatic_cash_inflows,
      icon: ArrowDownLeft,
      tone: "text-emerald-400",
    },
    {
      label: "Salidas automáticas",
      value: preview.automatic_cash_outflows,
      icon: ArrowUpRight,
      tone: "text-amber-400",
    },
  ];

  return (
    <section className="space-y-4" aria-label="Resumen actual de caja">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Resumen actual
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Calculado por PlayNow API hasta {new Intl.DateTimeFormat(
              "es-NI",
              { dateStyle: "medium", timeStyle: "short" }
            ).format(new Date(preview.period.until))}.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <RefreshCw
            className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500">{item.label}</p>
                <Icon className={`h-5 w-5 ${item.tone}`} />
              </div>

              <p className={`mt-4 text-2xl font-semibold ${item.tone}`}>
                {formatCashMoney(item.value, currency)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <dl className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-3">
          <div className="pb-2 pt-1 text-sm font-medium text-white">
            Operaciones automáticas en efectivo
          </div>
          <SummaryItem label="Ventas cash" value={preview.sales.cash} currency={currency} />
          <SummaryItem label="Compras cash" value={preview.cash_purchases} currency={currency} />
          <SummaryItem label="Gastos cash" value={preview.cash_expenses} currency={currency} />
          <SummaryItem label="Cobros de deuda cash" value={preview.cash_debt_payments_received} currency={currency} />
          <SummaryItem label="Pagos de deuda cash" value={preview.cash_debt_payments_made} currency={currency} />
        </dl>

        <dl className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-3">
          <div className="pb-2 pt-1 text-sm font-medium text-white">
            Movimientos manuales
          </div>
          <SummaryItem label="Depósitos" value={preview.movements.deposits} currency={currency} />
          <SummaryItem label="Retiros" value={preview.movements.withdrawals} currency={currency} />
          <SummaryItem label="Adelantos a empleados" value={preview.movements.employee_advances} currency={currency} />
          <SummaryItem label="Reintegros de empleados" value={preview.movements.employee_repayments} currency={currency} />
          <SummaryItem label="Otros ingresos" value={preview.movements.other_income} currency={currency} />
          <SummaryItem label="Otros gastos" value={preview.movements.other_expense} currency={currency} />
        </dl>
      </div>
    </section>
  );
}
