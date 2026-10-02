import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  DebtSummary,
  InventorySummary,
  MonthlySummary,
  PaymentSummary,
} from "@/types/report";
import {
  formatReportDate,
  formatReportMoney,
  hasNonZeroMoney,
} from "@/components/reports/report-format";

function Metric({ label, value, detail, tone = "neutral" }: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-black/20 p-4",
      tone === "positive" ? "border-emerald-500/20" : tone === "negative" ? "border-orange-500/20" : "border-white/10"
    )}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">{value}</p>
      {detail && <p className="mt-1 text-xs text-zinc-600">{detail}</p>}
    </div>
  );
}

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function PaymentsReport({ data }: { data: PaymentSummary }) {
  const currency = data.business.currency;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Recibido" value={formatReportMoney(data.totals.payments_received, currency)} tone="positive" />
        <Metric label="Realizado" value={formatReportMoney(data.totals.payments_made, currency)} tone="negative" />
        <Metric label="Neto" value={formatReportMoney(data.totals.net_amount, currency)} detail="Balance entre ingresos y egresos" />
      </div>
      <Section title="Pagos de deuda" description="Cobros y pagos registrados dentro del período.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Metric label="Cobros de deuda" value={formatReportMoney(data.totals.debt_payments_received.total, currency)} detail={`${data.totals.debt_payments_received.count} pagos`} />
          <Metric label="Pagos de deuda" value={formatReportMoney(data.totals.debt_payments_made.total, currency)} detail={`${data.totals.debt_payments_made.count} pagos`} />
        </div>
      </Section>
      <Section title="Detalle por método" description="Cada fila corresponde a un método de pago concreto.">
        {data.results.length === 0 ? <p className="py-10 text-center text-sm text-zinc-500">Sin movimientos para este período.</p> : (
          <Table className="min-w-[760px]">
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="text-zinc-500">Método</TableHead><TableHead className="text-zinc-500">Tipo</TableHead><TableHead className="text-right text-zinc-500">Entradas</TableHead><TableHead className="text-right text-zinc-500">Salidas</TableHead><TableHead className="text-right text-zinc-500">Neto</TableHead></TableRow></TableHeader>
            <TableBody>{data.results.map((row) => <TableRow key={row.payment_method.public_id} className="border-white/10"><TableCell className="font-medium text-white">{row.payment_method.name}</TableCell><TableCell className="capitalize text-zinc-400">{row.payment_method.method_type}</TableCell><TableCell className="text-right text-zinc-300">{formatReportMoney(row.total_incoming, currency)}</TableCell><TableCell className="text-right text-zinc-300">{formatReportMoney(row.total_outgoing, currency)}</TableCell><TableCell className="text-right font-medium text-white">{formatReportMoney(row.net_amount, currency)}</TableCell></TableRow>)}</TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}

function partyName(row: DebtSummary["results"][number]) {
  const party = row.direction === "receivable" ? row.customer : row.direction === "payable" ? row.supplier : row.customer ?? row.supplier ?? row.employee;
  return party?.full_name ?? party?.name ?? "Sin contraparte disponible";
}

const DIRECTION_LABELS = { receivable: "Por cobrar", payable: "Por pagar", unclassified: "Sin clasificar" } as const;

export function DebtsReport({ data }: { data: DebtSummary }) {
  const currency = data.business.currency;
  const showUnclassified = data.unclassified.count > 0 || hasNonZeroMoney(data.unclassified.outstanding);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Cuentas por cobrar" value={formatReportMoney(data.accounts_receivable.outstanding, currency)} detail={`${data.accounts_receivable.pending_count} pendientes`} />
        <Metric label="Cuentas por pagar" value={formatReportMoney(data.accounts_payable.outstanding, currency)} detail={`${data.accounts_payable.pending_count} pendientes`} />
        {showUnclassified && <Metric label="Sin clasificar" value={formatReportMoney(data.unclassified.outstanding, currency)} detail={`${data.unclassified.count} registros`} />}
      </div>
      <Section title="Cartera al cierre del período" description="Importes históricos acumulados hasta la fecha final seleccionada.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Deuda original" value={formatReportMoney(data.portfolio_at_period_end.original_debt_total, currency)} />
          <Metric label="Pagado hasta el cierre" value={formatReportMoney(data.portfolio_at_period_end.paid_until_period_end, currency)} />
          <Metric label="Pendiente total bruto" value={formatReportMoney(data.portfolio_at_period_end.outstanding, currency)} detail="Suma direcciones; no es un balance neto." />
          <Metric label="Pendiente vencido" value={formatReportMoney(data.portfolio_at_period_end.overdue_outstanding, currency)} />
        </div>
      </Section>
      <Section title="Deudas generadas en el período" description={`${data.generated.count} registros por ${formatReportMoney(data.generated.total, currency)}.`}>
        {data.results.length === 0 ? <p className="py-10 text-center text-sm text-zinc-500">Sin deudas generadas en este período.</p> : (
          <Table className="min-w-[1050px]">
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="text-zinc-500">Dirección</TableHead><TableHead className="text-zinc-500">Contraparte</TableHead><TableHead className="text-right text-zinc-500">Total</TableHead><TableHead className="text-right text-zinc-500">Pagado al cierre</TableHead><TableHead className="text-right text-zinc-500">Pendiente al cierre</TableHead><TableHead className="text-zinc-500">Vencimiento</TableHead><TableHead className="text-zinc-500">Estado al cierre</TableHead></TableRow></TableHeader>
            <TableBody>{data.results.map((row) => <TableRow key={row.debt.public_id} className="border-white/10"><TableCell className="text-zinc-300">{DIRECTION_LABELS[row.direction]}</TableCell><TableCell className="font-medium text-white">{partyName(row)}</TableCell><TableCell className="text-right text-zinc-300">{formatReportMoney(row.total, currency)}</TableCell><TableCell className="text-right text-zinc-300">{formatReportMoney(row.paid_until_period_end, currency)}</TableCell><TableCell className="text-right font-medium text-white">{formatReportMoney(row.pending_at_period_end, currency)}</TableCell><TableCell className={cn("text-zinc-400", row.was_overdue_at_period_end && "text-red-400")}>{formatReportDate(row.due_date)}</TableCell><TableCell><span className={cn("rounded-full border px-2.5 py-1 text-xs", row.is_settled_at_period_end ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-orange-500/20 bg-orange-500/10 text-orange-300")}>{row.is_settled_at_period_end ? "Saldada" : "Pendiente"}</span></TableCell></TableRow>)}</TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}

export function MonthlyReport({ data }: { data: MonthlySummary }) {
  const currency = data.business.currency;
  const showUnclassified = hasNonZeroMoney(data.debts.outstanding_unclassified);
  return (
    <div className="space-y-6">
      <Section title="Actividad" description="Volumen comercial del mes seleccionado.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Ventas" value={formatReportMoney(data.transactions.sales.total, currency)} detail={`${data.transactions.sales.count} operaciones`} />
          <Metric label="Compras" value={formatReportMoney(data.transactions.purchases.total, currency)} detail={`${data.transactions.purchases.count} operaciones`} />
          <Metric label="Gastos" value={formatReportMoney(data.transactions.expenses.total, currency)} detail={`${data.transactions.expenses.count} operaciones`} />
        </div>
      </Section>
      <Section title="Flujo" description="Resumen de ingresos y egresos del período.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Recibido" value={formatReportMoney(data.payments.received, currency)} tone="positive" />
          <Metric label="Realizado" value={formatReportMoney(data.payments.made, currency)} tone="negative" />
          <Metric label="Neto" value={formatReportMoney(data.payments.net, currency)} detail="Balance del período" />
        </div>
      </Section>
      <Section title="Cartera al cierre" description="Receivables y payables se mantienen separados.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Cuentas por cobrar" value={formatReportMoney(data.debts.outstanding_receivables, currency)} />
          <Metric label="Cuentas por pagar" value={formatReportMoney(data.debts.outstanding_payables, currency)} />
          {showUnclassified && <Metric label="Sin clasificar" value={formatReportMoney(data.debts.outstanding_unclassified, currency)} />}
        </div>
      </Section>
      <Section title="Caja" description={`${data.cash_registers.closed_count} cajas cerradas durante el mes.`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Esperado" value={formatReportMoney(data.cash_registers.expected_total, currency)} />
          <Metric label="Contado" value={formatReportMoney(data.cash_registers.counted_total, currency)} />
          <Metric label="Diferencia" value={formatReportMoney(data.cash_registers.difference_total, currency)} />
          <Metric label="Faltantes" value={formatReportMoney(data.cash_registers.shortages_total, currency)} />
          <Metric label="Sobrantes" value={formatReportMoney(data.cash_registers.surpluses_total, currency)} />
        </div>
      </Section>
      <Section title="Comisiones" description="Información secundaria del cierre mensual dinámico.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Comisión bruta" value={formatReportMoney(data.commissions.gross_commission_total, currency)} detail={`${data.commissions.settlements_count} liquidaciones`} />
          <Metric label="Comisión neta por pagar" value={formatReportMoney(data.commissions.net_commission_payable, currency)} />
          <Metric label="Pagado" value={formatReportMoney(data.commissions.paid.total, currency)} detail={`${data.commissions.paid.count} liquidaciones`} />
          <Metric label="Pendiente" value={formatReportMoney(data.commissions.pending.total, currency)} detail={`${data.commissions.pending.count} liquidaciones`} />
        </div>
      </Section>
    </div>
  );
}

export function InventoryReport({ data }: { data: InventorySummary }) {
  const totals = data.totals;
  return (
    <div className="space-y-6">
      <Section title="Resumen de inventario" description="Existencias y movimientos registrados durante el período.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Metric label="Productos" value={String(totals.items_count)} />
          <Metric label="Stock inicial" value={String(totals.opening_stock)} />
          <Metric label="Entradas" value={String(totals.entries)} />
          <Metric label="Ventas" value={String(totals.sales)} />
          <Metric label="Ajustes +" value={String(totals.positive_adjustments)} />
          <Metric label="Ajustes -" value={String(totals.negative_adjustments)} />
          <Metric label="Movimiento neto" value={String(totals.net_movement)} />
          <Metric label="Stock final" value={String(totals.closing_stock)} />
          <Metric label="Stock actual" value={String(totals.current_stock)} />
        </div>
      </Section>
      <Section title="Detalle por producto">
        {data.results.length === 0 ? <p className="py-10 text-center text-sm text-zinc-500">Sin productos disponibles.</p> : (
          <Table className="min-w-[1050px]">
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="text-zinc-500">Producto</TableHead><TableHead className="text-right text-zinc-500">Inicial</TableHead><TableHead className="text-right text-zinc-500">Entradas</TableHead><TableHead className="text-right text-zinc-500">Ventas</TableHead><TableHead className="text-right text-zinc-500">Ajustes +</TableHead><TableHead className="text-right text-zinc-500">Ajustes -</TableHead><TableHead className="text-right text-zinc-500">Movimiento neto</TableHead><TableHead className="text-right text-zinc-500">Final</TableHead><TableHead className="text-right text-zinc-500">Actual</TableHead></TableRow></TableHeader>
            <TableBody>{data.results.map((row) => <TableRow key={row.product.public_id} className="border-white/10"><TableCell className="font-medium text-white">{row.product.title}</TableCell><TableCell className="text-right text-zinc-300">{row.opening_stock}</TableCell><TableCell className="text-right text-zinc-300">{row.entries}</TableCell><TableCell className="text-right text-zinc-300">{row.sales}</TableCell><TableCell className="text-right text-zinc-300">{row.positive_adjustments}</TableCell><TableCell className="text-right text-zinc-300">{row.negative_adjustments}</TableCell><TableCell className="text-right text-zinc-300">{row.net_movement}</TableCell><TableCell className="text-right text-zinc-300">{row.closing_stock}</TableCell><TableCell className="text-right font-medium text-white">{row.current_stock}</TableCell></TableRow>)}</TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
}
