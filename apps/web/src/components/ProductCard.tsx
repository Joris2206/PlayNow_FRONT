import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
};

type Props = {
  product: Product;
  href?: string;        // opcional: por si quieres sobreescribir la URL
  className?: string;   // opcional: estilos extra
};

export default function ProductCard({ product: p, href, className }: Props) {
  const to = href ?? `/products/${encodeURIComponent(p.id)}`;

  return (
    <a
      href={to}
      className={`border rounded-2xl overflow-hidden hover:shadow-md transition bg-white/60 ${className ?? ""}`}
    >
      <div className="aspect-[4/3] relative bg-neutral-100">
        {/* Usamos <img> para evitar configurar dominios de Next/Image */}
        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-2">{p.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold">${p.price.toFixed(2)}</span>
          {p.rating != null && (
            <span className="text-sm text-neutral-600">⭐ {p.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </a>
  );
}
