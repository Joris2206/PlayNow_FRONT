import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Search, User, ShoppingCart, Facebook, Instagram } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlayNow",
  description: "Landing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased !bg-white text-[#233746]`}
      >
        <header className="sticky top-0 z-50 w-full shadow-md bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-10 h-[80px] w-full flex items-center justify-between gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 text-black font-bold text-xl"
            >
              <img
                src="/PlayNowLogo.png"
                alt="PlayNow"
                className="h-28 w-28 object-contain"
              />
              {/* <span className="hidden sm:inline">PlayNow</span> */}
            </Link>

            {/* Search - desktop */}
            <form className="hidden md:flex flex-1 max-w-2xl mx-2">
              <label className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar juegos, consolas..."
                  className="w-full rounded-xl bg-white/95 text-[#233746] placeholder-black/50 px-4 py-2 pr-10 border border-[#EF6C3C] outline-none focus:ring-2 focus:ring-[#EF6C3C]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5"
                >
                  <Search className="h-5 w-5 text-[#233746]" />
                </button>
              </label>
            </form>

            {/* Icons */}
            <nav className="flex items-center gap-4 text-white">
              <Link
                href="/store"
                className="hidden md:inline text-black/80 hover:text-black transition"
              >
                Tienda
              </Link>
              <Link
                href="/account"
                className="text-black/80 hover:text-black transition"
                aria-label="Cuenta"
              >
                <User className="h-6 w-6" />
              </Link>
              <Link
                href="/cart"
                className="relative text-black/80 hover:text-black transition"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-white text-[#e60012] text-[15px] leading-none px-1.5 py-[2px] rounded-full">
                  3
                </span>
              </Link>
            </nav>
          </div>
        </header>

        {children}

        {/* ===== FOOTER (global) ===== */}
        <footer className="mt-20 bg-[#233746] text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-14 grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img src="/PlayNowLogo.png" alt="PlayNow" className="h-8 w-8" />
                <span className="font-semibold text-lg">PlayNow</span>
              </div>
              <p className="mt-3 text-white/80 text-sm">
                Tu mundo gamer en un solo lugar: preventas, ediciones deluxe,
                accesorios y más.
              </p>
              <div className="flex gap-5">
                <SocialIcon
                  href="https://facebook.com"
                  icon="/MediaLogos/Facebook.svg"
                  color="bg-gray-400"
                  hoverColor="hover:bg-blue-600"
                  size="h-10 w-10"
                />
                <SocialIcon
                  href="https://www.tiktok.com"
                  icon="/MediaLogos/TikTok.svg"
                  color="bg-gray-400"
                  hoverColor="hover:bg-black"
                  size="h-10 w-10"
                />
                <SocialIcon
                  href="https://instagram.com"
                  icon="/MediaLogos/Instagram.svg"
                  color="bg-gray-400"
                  hoverColor="hover:bg-pink-500"
                  size="h-10 w-10"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Productos</h4>
              <ul className="space-y-2 text-white/85">
                <li>
                  <Link href="/store?cat=juegos" className="hover:underline">
                    Juegos
                  </Link>
                </li>
                <li>
                  <Link href="/store?cat=consolas" className="hover:underline">
                    Consolas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/store?cat=accesorios"
                    className="hover:underline"
                  >
                    Accesorios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Servicio técnico</h4>
              <ul className="space-y-2 text-white/85">
                <li>
                  <Link href="/support/manual" className="hover:underline">
                    Manual
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:underline">
                    Asistencia
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 flex items-center">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 text-sm text-white/70">
              © {new Date().getFullYear()} PlayNow. Todos los derechos
              reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
