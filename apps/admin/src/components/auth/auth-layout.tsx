import { Gamepad2 } from "lucide-react";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-white/10 p-12 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 shadow-lg shadow-red-500/20">
              <Gamepad2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight">
                PlayNow
              </p>

              <p className="text-xs text-zinc-500">
                Administration
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur">
              Panel administrativo
            </div>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Todo tu negocio,
              <span className="block text-red-500">
                bajo control.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
              Gestiona inventario, ventas, clientes, proveedores y
              operaciones desde un solo lugar.
            </p>
          </div>

          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} PlayNow
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
                <Gamepad2 className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold">
                PlayNow
              </span>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}