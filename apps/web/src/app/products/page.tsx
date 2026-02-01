import ProductCard from "@/components/ProductCard";
import Input from "@/components/Input";

// Página de catálogo estático (sin API) con filtros “de mentira” y un grid de ejemplo.
type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
};

const MOCK: Product[] = [
  {
    id: "1",
    name: "Auriculares Pro",
    price: 89.99,
    imageUrl: "https://picsum.photos/seed/a/640/480",
    rating: 4.6,
  },
  {
    id: "2",
    name: "Smartwatch X",
    price: 129.0,
    imageUrl: "https://picsum.photos/seed/b/640/480",
    rating: 4.3,
  },
  {
    id: "3",
    name: "Cámara Compacta",
    price: 240.0,
    imageUrl: "https://picsum.photos/seed/c/640/480",
    rating: 4.8,
  },
  {
    id: "4",
    name: "Parlante Bluetooth",
    price: 39.9,
    imageUrl: "https://picsum.photos/seed/d/640/480",
    rating: 4.1,
  },
  {
    id: "5",
    name: "Teclado Mecánico",
    price: 75.0,
    imageUrl: "https://picsum.photos/seed/e/640/480",
    rating: 4.7,
  },
  {
    id: "6",
    name: "Mouse Inalámbrico",
    price: 22.5,
    imageUrl: "https://picsum.photos/seed/f/640/480",
    rating: 4.0,
  },
];

export default function ProductsPage() {
  return (
    <main className="grid grid-cols-12 gap-6">
      {/* Sidebar de filtros (estático) */}
      <aside className="col-span-12 md:col-span-3">
        <form
          className="border rounded-2xl p-4 space-y-3 bg-white/60"
          action="/products"
          method="get"
        >
          <Input title="Busqueda" name="q" placeholder="buscar" />
          <div className="grid grid-cols-2 gap-2">
            <Input title="min" name="min" />
            <Input title="max" name="max"/>
          </div>
          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              name="category"
              className="mt-1 w-full border rounded-xl px-3 py-2"
            >
              <option value="">Todas</option>
              <option value="electronica">Electrónica</option>
              <option value="hogar">Hogar</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Ordenar</label>
            <select
              name="sort"
              className="mt-1 w-full border rounded-xl px-3 py-2"
            >
              <option value="relevance">Relevancia</option>
              <option value="price_asc">Precio ↑</option>
              <option value="price_desc">Precio ↓</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <button className="w-full rounded-xl bg-black text-white px-4 py-2 font-medium">
            Aplicar
          </button>
        </form>
      </aside>

      {/* Grid de productos mock */}
      <section className="col-span-12 md:col-span-9">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-neutral-600">
            {MOCK.length} resultados
          </span>
          <div className="text-sm text-neutral-600">Página 1 / 1</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Paginación dummy */}
        <nav className="mt-6 flex gap-2 justify-center">
          <span className="px-3 py-2 rounded border opacity-50">Anterior</span>
          <span className="px-3 py-2 text-sm">Página 1 / 1</span>
          <span className="px-3 py-2 rounded border opacity-50">Siguiente</span>
        </nav>
      </section>
    </main>
  );
}
