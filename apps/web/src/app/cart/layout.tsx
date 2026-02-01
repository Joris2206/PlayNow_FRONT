import type { ReactNode } from "react";

export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Cart</h1>
      </header>
      {children}
    </section>
  );
}
