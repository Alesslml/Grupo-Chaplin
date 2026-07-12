import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const links = [
  { to: "/nosotros", label: "Nosotros" },
  { to: "/producciones", label: "Producciones" },
  { to: "/talleres", label: "Talleres" },
  { to: "/fesmica", label: "Festival" },
  { to: "/aliados", label: "Aliados" },
  { to: "/equipo", label: "Equipo" },
  { to: "/noticias", label: "Noticias" },
  { to: "/contacto", label: "Contacto" },
];

// TODO: reemplazar por el link real cuando exista el sistema de compra propio de Chaplin.
const TICKETS_URL = "https://teleticket.com.pe";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "bg-negro border-b border-rojo/80 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo oficial */}
          <Link to="/" className="flex items-center group" aria-label="Chaplin Grupo Cultural">
            <img
              src="/logo-chaplin.png"
              alt="Chaplin Grupo Cultural"
              className="h-12 lg:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              style={{ filter: "invert(1) hue-rotate(180deg)" }}
            />
          </Link>

          {/* Links desktop */}
          <ul className="hidden xl:flex items-center gap-6">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="font-body font-semibold text-[12px] uppercase tracking-[0.15em] text-blanco hover:text-rojo transition-colors duration-300"
                  activeProps={{
                    className:
                      "font-body font-semibold text-[12px] uppercase tracking-[0.15em] text-rojo transition-colors duration-300",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex font-body font-bold text-[12px] uppercase tracking-[0.2em] text-negro bg-rojo px-5 py-2.5 hover:bg-blanco transition-colors duration-300"
            >
              Entradas
            </a>

            {/* Hamburger mobile */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              className="xl:hidden flex flex-col gap-1.5 w-8"
            >
              <span className="h-[2px] bg-blanco w-full" />
              <span className="h-[2px] bg-rojo w-2/3 ml-auto" />
              <span className="h-[2px] bg-blanco w-full" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        className={`fixed inset-0 z-[200] lg:hidden transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-negro/80" onClick={() => setOpen(false)} />
        <aside
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-negro border-l-2 border-rojo flex flex-col transition-transform duration-500 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-8 py-6 border-b border-gris-textura">
            <img
              src="/logo-chaplin.png"
              alt="Chaplin Grupo Cultural"
              className="h-10 w-auto object-contain"
              style={{ filter: "invert(1) hue-rotate(180deg)" }}
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="text-blanco text-3xl font-display hover:text-rojo leading-none"
            >
              ×
            </button>
          </div>

          <ul className="flex-1 px-8 py-8 space-y-0 overflow-y-auto">
            {links.map((l) => (
              <li key={l.to} className="border-b border-gris-humo/20">
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl text-blanco hover:text-rojo block tracking-wide py-4 transition-colors duration-300"
                  activeProps={{ className: "font-display text-2xl text-rojo block tracking-wide py-4" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-5">
              <a
                href={TICKETS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-block font-body font-bold text-sm uppercase tracking-[0.2em] text-negro bg-rojo px-6 py-3"
              >
                Entradas
              </a>
            </li>
          </ul>

          <div className="px-8 py-8 border-t border-rojo shrink-0">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gris-humo mb-2">
              Ica · Perú
            </p>
            <a
              href="https://wa.me/51956060826"
              className="font-display text-rojo text-2xl hover:text-blanco transition-colors"
            >
              956 060 826
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
