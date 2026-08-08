import {
  Boxes,
  CircleDollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Ventas de hoy",
    value: "C$ 0.00",
    description: "Sin ventas registradas",
    icon: CircleDollarSign,
  },
  {
    label: "Transacciones",
    value: "0",
    description: "Registradas hoy",
    icon: ShoppingCart,
  },
  {
    label: "Productos",
    value: "0",
    description: "En el inventario",
    icon: Boxes,
  },
  {
    label: "Clientes",
    value: "0",
    description: "Clientes registrados",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-red-500">
          Resumen general
        </p>

        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          Dashboard
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Consulta rápidamente el estado actual de PlayNow.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.045]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="text-sm text-zinc-500">
                {stat.label}
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                {stat.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="min-h-80 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h3 className="font-semibold">
              Ventas recientes
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Las últimas operaciones aparecerán aquí.
            </p>
          </div>

          <div className="flex min-h-56 items-center justify-center">
            <p className="text-sm text-zinc-600">
              No hay movimientos para mostrar.
            </p>
          </div>
        </section>

        <section className="min-h-80 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h3 className="font-semibold">
              Estado del inventario
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Alertas y disponibilidad de productos.
            </p>
          </div>

          <div className="flex min-h-56 items-center justify-center">
            <p className="text-sm text-zinc-600">
              Sin alertas de inventario.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}