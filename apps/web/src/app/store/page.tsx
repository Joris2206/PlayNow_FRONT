"use client";
import Link from "next/link";
import { useRef } from "react";

/* ========= Tipos ========= */
type Product = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  platform: "PC" | "PS5" | "Xbox" | "Switch";
  rating?: number;
  badge?: "Nuevo" | "Oferta" | "Top";
};
type Post = { id: string; title: string; excerpt: string; imageUrl: string; date: string };

/* ========= Datos mock ========= */
const CATEGORIES = ["Acción", "Aventura", "Deportes", "Indie", "RPG", "Carreras", "Estratégia", "Simulación"];
const NEW_RELEASES: Product[] = [
  { id: "n1", title: "Star Odyssey", price: 59.99, platform: "PS5", imageUrl: "https://picsum.photos/seed/n1/1000/700", rating: 4.6, badge: "Nuevo" },
  { id: "n2", title: "Dungeon Maker", price: 39.99, platform: "PC", imageUrl: "https://picsum.photos/seed/n2/1000/700", rating: 4.2, badge: "Nuevo" },
  { id: "n3", title: "Racing Legends", price: 49.99, platform: "Xbox", imageUrl: "https://picsum.photos/seed/n3/1000/700", rating: 4.4, badge: "Nuevo" },
  { id: "n4", title: "Pixel Farm 2", price: 29.99, platform: "Switch", imageUrl: "https://picsum.photos/seed/n4/1000/700", rating: 4.1, badge: "Nuevo" },
];
const TOP_SELLERS: Product[] = [
  { id: "t1", title: "Battle Royale X", price: 19.99, platform: "PC", imageUrl: "https://picsum.photos/seed/t1/1000/700", rating: 4.8, badge: "Top" },
  { id: "t2", title: "Shadow Ninja", price: 49.99, platform: "PS5", imageUrl: "https://picsum.photos/seed/t2/1000/700", rating: 4.7, badge: "Top" },
  { id: "t3", title: "Goal Masters 25", price: 59.99, platform: "Xbox", imageUrl: "https://picsum.photos/seed/t3/1000/700", rating: 4.5, badge: "Top" },
  { id: "t4", title: "Pocket Creatures", price: 44.99, platform: "Switch", imageUrl: "https://picsum.photos/seed/t4/1000/700", rating: 4.9, badge: "Top" },
];
const DEALS: Product[] = [
  { id: "d1", title: "Metro Tunnels Redux", price: 9.99, platform: "PC", imageUrl: "https://picsum.photos/seed/d1/1000/700", rating: 4.3, badge: "Oferta" },
  { id: "d2", title: "Castle Builder", price: 14.99, platform: "PS5", imageUrl: "https://picsum.photos/seed/d2/1000/700", rating: 4.0, badge: "Oferta" },
  { id: "d3", title: "Desert Rally", price: 12.49, platform: "Xbox", imageUrl: "https://picsum.photos/seed/d3/1000/700", rating: 4.2, badge: "Oferta" },
  { id: "d4", title: "Farm Cozy", price: 7.99, platform: "Switch", imageUrl: "https://picsum.photos/seed/d4/1000/700", rating: 4.1, badge: "Oferta" },
];
const POSTS: Post[] = [
  { id: "p1", title: "Hands-on: Star Odyssey", excerpt: "Exploración espacial y combate táctico. Probamos la beta…", imageUrl: "https://picsum.photos/seed/p1/1200/800", date: "2025-01-12" },
  { id: "p2", title: "Guía Dungeon Maker", excerpt: "Crafteo, builds y progresión sin frustrarte.", imageUrl: "https://picsum.photos/seed/p2/1200/800", date: "2025-01-08" },
  { id: "p3", title: "Indies imperdibles", excerpt: "Pixel art, roguelikes y simuladores chill del mes.", imageUrl: "https://picsum.photos/seed/p3/1200/800", date: "2025-01-02" },
];

/* ========= UIs creativas ========= */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`max-w-7xl mx-auto px-6 md:px-10 py-10 ${className}`}>{children}</section>;
}

function Badge({ children, tone }: { children: string; tone: "Nuevo" | "Oferta" | "Top" }) {
  const styles =
    tone === "Nuevo" ? "bg-primary text-white" : tone === "Oferta" ? "bg-darkBlue text-white" : "bg-midBlue text-white";
  return <span className={`px-2 py-0.5 text-xs rounded ${styles}`}>{children}</span>;
}

function Price({ value }: { value: number }) {
  return <span className="font-bold text-darkBlue">${value.toFixed(2)}</span>;
}
function Rating({ value }: { value?: number }) {
  if (value == null) return null;
  return <span className="text-sm text-darkBlue/70">⭐ {value.toFixed(1)}</span>;
}

/** Tilt 3D suave con CSS variables (sin libs) */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / r.height) * -10;
    const ry = ((x - r.width / 2) / r.width) * 10;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="transition-transform will-change-transform"
      style={{ transform: "perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry))" }}
    >
      {children}
    </div>
  );
}

/** Título con glitch + scanlines usando styled-jsx */
function GlitchTitle({ text }: { text: string }) {
  return (
    <div className="relative inline-block">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight glitch">
        {text}
        <span aria-hidden className="glitch-layer">{text}</span>
        <span aria-hidden className="glitch-layer2">{text}</span>
      </h1>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent 0 2px, rgba(255,255,255,.06) 2px 3px)",
        }}
      />
      <style jsx>{`
        .glitch { position:relative; }
        .glitch-layer, .glitch-layer2 {
          position:absolute; inset:0;
        }
        .glitch-layer { color:#EF6C3C; clip-path: polygon(0 2%, 100% 2%, 100% 40%, 0 40%); animation: g1 2s infinite linear alternate; }
        .glitch-layer2{ color:#47829B; clip-path: polygon(0 60%, 100% 60%, 100% 98%, 0 98%); animation: g2 2.2s infinite linear alternate; }
        @keyframes g1 { from { transform: translate(1px, 0); } to { transform: translate(0, 1px); } }
        @keyframes g2 { from { transform: translate(-1px, 0); } to { transform: translate(0, -1px); } }
      `}</style>
    </div>
  );
}

/** Marquee infinito sin libs */
function Marquee({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden border-y border-white/10 bg-darkBlue text-lightGray">
      <div className="flex gap-8 py-3 whitespace-nowrap animate-[marquee_28s_linear_infinite]">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="opacity-90">{t} •</span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <TiltCard>
      <Link
        href={`/products/${encodeURIComponent(p.id)}`}
        className="group rounded-2xl overflow-hidden bg-white shadow-sm border"
      >
        <div className="relative aspect-[4/3] bg-lightGray">
          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
          {p.badge && (
            <div className="absolute left-3 top-3">
              <Badge tone={p.badge}>{p.badge}</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-xs text-darkBlue/60">{p.platform}</div>
          <h3 className="mt-1 font-medium text-darkBlue group-hover:underline">{p.title}</h3>
          <div className="mt-2 flex items-center justify-between">
            <Price value={p.price} />
            <Rating value={p.rating} />
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

export default function ProductsPage() {
  return (
    <main className="!bg-[] min-h-dvh">
      
      {/* ===== HERO NEO-ARCADE ===== */}
      <section className="bg-gradient-to-b from-darkBlue to-midBlue">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center text-lightGray">
          <div>
            <GlitchTitle text="PlayNow" />
            <p className="mt-4 text-lightGray/90">
              La tienda gaming mas completa. Pre-ventas, ediciones deluxe, tarjetas y más.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/products" className="px-5 py-3 rounded-2xl bg-primary text-white font-medium hover:opacity-90">
                Ver catálogo
              </Link>
              <Link href="/contact" className="px-5 py-3 rounded-2xl border border-white/30 text-lightGray hover:bg-white/10">
                Soporte
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map((i)=>(
              <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3]">
                <img src={`https://picsum.photos/seed/hero${i}/800/600`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <Marquee items={CATEGORIES} />
      </section>

      {/* ===== NUEVOS LANZAMIENTOS ===== */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-darkBlue">Nuevos lanzamientos</h2>
          <Link href="/products?sort=new" className="text-sm underline text-darkBlue/80 hover:text-darkBlue">Ver todo</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NEW_RELEASES.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Section>

      {/* ===== TOP VENTAS EN FAJA OSCURA + SCROLL SNAP ===== */}
      <section className="bg-darkBlue">
        <Section className="!py-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-lightGray">Top ventas</h2>
            <Link href="/products?sort=top" className="text-sm underline text-lightGray/80 hover:text-white">Ver todo</Link>
          </div>
          <div className="overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-4 min-w-max">
              {TOP_SELLERS.map((p) => (
                <div key={p.id} className="snap-start shrink-0 w-[260px]">
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* ===== OFERTAS DEL DÍA (radial) ===== */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-darkBlue">Ofertas del día</h2>
          <Link href="/products?deal=1" className="text-sm underline text-darkBlue/80 hover:text-darkBlue">Ver todas</Link>
        </div>
        <div
          className="rounded-2xl p-4 md:p-6"
          style={{ background: "radial-gradient(1000px 400px at 20% -20%, rgba(71,130,155,0.20), transparent), white" }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEALS.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </Section>

      {/* ===== BLOG / POSTS con efecto CRT sutil ===== */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-darkBlue">Noticias y guías</h2>
          <Link href="/blog" className="text-sm underline text-darkBlue/80 hover:text-darkBlue">Ver blog</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {POSTS.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="group border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition shadow-sm">
              <div className="relative aspect-[16/9] bg-lightGray">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
                <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
                  style={{ backgroundImage:"repeating-linear-gradient(transparent 0 2px, rgba(35,55,70,.14) 2px 3px)" }}
                />
              </div>
              <div className="p-4">
                <time className="text-xs text-darkBlue/60">{new Date(post.date).toLocaleDateString()}</time>
                <h3 className="mt-1 font-semibold text-darkBlue group-hover:underline">{post.title}</h3>
                <p className="mt-1 text-sm text-darkBlue/70">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ===== NEWSLETTER BUTTON 3D ===== */}
      <section className="bg-primary">
        <Section className="!py-12 text-white">
          <div className="grid md:grid-cols-3 items-center gap-6">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold">Recibe ofertas y lanzamientos</h3>
              <p className="text-white/90">Suscríbete y sé el primero en enterarte.</p>
            </div>
            <form className="flex gap-2">
              <input type="email" placeholder="tu@email.com" className="flex-1 bg-white text-darkBlue rounded-xl px-3 py-2" />
              <button className="relative px-5 py-2 rounded-xl bg-darkBlue text-white font-medium transition active:translate-y-[2px]">
                <span className="absolute inset-x-0 -bottom-[4px] h-[4px] rounded-xl bg-black/40" />
                Suscribirme
              </button>
            </form>
          </div>
        </Section>
      </section>
    </main>
  );
}
