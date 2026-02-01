import type { ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Productos</h1>
        <p className="text-neutral-600">Explora nuestro catálogo y encuentra lo que buscas.</p>
      </header>
      {children}
    </section>
  );
}
