import {
  Boxes,
  CircleDollarSign,
  HandCoins,
  Landmark,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { formatReportMoney } from "@/components/reports/report-format";
import type { DashboardOverview } from "@/types/dashboard";

type DashboardOverviewContentProps = {
  overview: DashboardOverview;
};

function MoneyMetric({ label, value, currency, detail }: {
  label: string;
  value: string;
  currency: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">
        {formatReportMoney(value, currency)}
      </p>
      {detail && <p className="mt-1 text-xs text-zinc-600">{detail}</p>}
    </div>
  );
}

export default function DashboardOverviewContent({ overview }: DashboardOverviewContentProps) {
  const { cards, activity, cash, business } = overview;
  const currency = business.currency;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5 sm:p-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <CircleDollarSign className="h-5 w-5" />
            <h2 className="font-medium">Pagos recibidos</h2>
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{formatReportMoney(cards.payments_received, currency)}</p>
          <p className="mt-2 text-sm text-zinc-500">Entradas autoritativas del período.</p>
        </article>
        <article className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.05] p-5 sm:p-6">
          <div className="flex items-center gap-3 text-orange-400">
            <HandCoins className="h-5 w-5" />
            <h2 className="font-medium">Pagos realizados</h2>
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{formatReportMoney(cards.payments_made, currency)}</p>
          <p className="mt-2 text-sm text-zinc-500">Salidas autoritativas del período.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Actividad comercial</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Operación del período</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MoneyMetric label="Ventas" value={cards.sales_total} currency={currency} detail={`${activity.sales_count} operaciones`} />
          <MoneyMetric label="Compras" value={cards.purchases_total} currency={currency} detail={`${activity.purchases_count} operaciones`} />
          <MoneyMetric label="Gastos" value={cards.expenses_total} currency={currency} detail={`${activity.expenses_count} operaciones`} />
          <MoneyMetric label="Resultado comercial antes de costos" value={cards.gross_margin_before_costs} currency={currency} detail="Ventas menos compras y gastos, calculado por API." />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-center gap-3"><WalletCards className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-white">Posición financiera</h2></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MoneyMetric label="Cuentas por cobrar" value={cards.outstanding_receivables} currency={currency} />
            <MoneyMetric label="Cuentas por pagar" value={cards.outstanding_payables} currency={currency} />
          </div>
          <p className="mt-4 text-sm text-zinc-500">{activity.pending_debts_count} deudas pendientes. Las posiciones se muestran por separado, sin netear.</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-center gap-3"><Landmark className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-white">Estado operativo</h2></div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {([
              { label: "Caja abierta", value: activity.open_cash_register ? "Sí" : "No", icon: ReceiptText },
              { label: "Diferencia de cajas cerradas", value: formatReportMoney(cash.difference_total, currency), icon: CircleDollarSign },
              { label: "Unidades actuales", value: String(cards.current_inventory_units), icon: PackageCheck },
              { label: "Stock bajo", value: String(activity.low_stock_items_count), icon: Boxes },
              { label: "Sin stock", value: String(activity.out_of_stock_items_count), icon: ShoppingCart },
              { label: "Comisiones pendientes", value: formatReportMoney(cards.pending_commissions, currency), icon: HandCoins },
            ] satisfies Array<{ label: string; value: string; icon: LucideIcon }>).map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <div><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 text-sm font-medium text-white">{value}</dd></div>
              </div>
            ))}
          </dl>
        </article>
      </section>
    </div>
  );
}
