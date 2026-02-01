"use client";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      {/* ===== HERO banda oscura con logo ===== */}
      <section className="bg-[#233746]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-white">
            <p className="uppercase tracking-widest text-white/70 text-sm">PlayNow</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
              La tienda gaming <br className="hidden md:block" /> más completa
            </h1>
            <p className="mt-4 text-white/85 max-w-xl">
              Pre-ventas, ediciones deluxe, tarjetas y accesorios oficiales. Todo en un mismo lugar.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/store" className="px-5 py-3 rounded-xl bg-[#EF6C3C] text-white font-medium hover:opacity-90">
                Explorar
              </Link>
              <Link href="/about" className="px-5 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10">
                Sobre nosotros
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/PlayNowLogo.png"
              alt="PlayNow"
              className="w-[320px] h-auto drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      </section>

      {/* ===== Marcas ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <ul className="flex items-center justify-center md:justify-between gap-8 flex-wrap">
            {[
              { name: "PlayStation", file: "/EnterpriseLogos/PlayStation-Logo.svg" },
              { name: "Xbox", file: "/EnterpriseLogos/Xbox-Logo.svg" },
              { name: "Switch", file: "/EnterpriseLogos/Switch-Logo.svg" },
              { name: "Corsair", file: "/EnterpriseLogos/Corsair-Logo.svg" },
              { name: "Amazon", file: "/EnterpriseLogos/Amazon-Logo.svg" },
            ].map((brand) => (
              <li key={brand.name} className="flex items-center justify-center">
                <img
                  src={brand.file}
                  alt={brand.name}
                  className="h-10 w-auto md:h-12 opacity-100 transition"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== Bloques de contenido / promos ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 grid md:grid-cols-2 gap-8">
        {/* Bloque 1 */}
        <article className="grid gap-4 md:grid-cols-5">
          <img
            src="https://images.unsplash.com/photo-1614294149010-7aa9e92344bb?q=80&w=1200&auto=format&fit=crop"
            alt="setup gamer"
            className="rounded-2xl object-cover h-56 md:h-full md:col-span-3"
          />
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Tu mundo gamer comienza aquí</h3>
              <p className="mt-2 text-[#233746]/80">
                Descubre lanzamientos y ediciones exclusivas con envío rápido. Catálogo curado para todas las consolas.
              </p>
            </div>
            <Link href="/store?tag=featured" className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#EF6C3C] text-white font-medium w-max">
              Explorar
            </Link>
          </div>
        </article>

        {/* Bloque 2 */}
        <article className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-3 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1606813907291-76de0d3c8c0c?q=80&w=1200&auto=format&fit=crop"
              alt="accesorios"
              className="rounded-2xl h-40 md:h-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1614294148890-4f6d88e642d3?q=80&w=1200&auto=format&fit=crop"
              alt="consola"
              className="rounded-2xl h-40 md:h-full object-cover"
            />
          </div>
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Lleva tu experiencia al máximo nivel</h3>
              <p className="mt-2 text-[#233746]/80">
                Accesorios oficiales y perifericos premium para completar tu setup.
              </p>
            </div>
            <Link href="/store?cat=accesorios" className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#233746] text-white font-medium w-max">
              Ver accesorios
            </Link>
          </div>
        </article>
      </section>

      {/* ===== Social box ===== */}
      {/* <section className="max-w-7xl mx-auto px-4 md:px-10 mt-12">
        <div className="rounded-2xl bg-[#D9D9D9]/60 p-8 md:p-10 text-center">
          <h4 className="font-semibold">Síguenos en nuestras redes sociales</h4>
          <div className="mt-5 flex items-center justify-center gap-4">
            <Link href="https://www.tiktok.com" target="_blank" className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 border border-black/5 flex items-center gap-2">
              <span className="sr-only">TikTok</span>
              <img src="/MediaLogos/TikTok.svg" alt="PlayNow" className="h-10 w-10 object-contain" />
            </Link>
            <Link href="https://facebook.com" target="_blank" className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 border border-black/5 flex items-center gap-2">
              <span className="sr-only">Facebook</span>
              <img src="/MediaLogos/Facebook.svg" alt="PlayNow" className="h-10 w-10 object-contain" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 border border-black/5 flex items-center gap-2">
              <span className="sr-only">Instagram</span>
              <img src="/MediaLogos/Instagram.svg" alt="PlayNow" className="h-10 w-10 object-contain" />
            </Link>
          </div>
        </div>
      </section> */}
    </main>
  );
}
