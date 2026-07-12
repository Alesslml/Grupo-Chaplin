import { Instagram, Facebook, MessageCircle, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { TikTokIcon } from "@/components/chaplin/TikTokIcon";

const navLinks = [
  { to: "/nosotros", label: "Nosotros" },
  { to: "/producciones", label: "Producciones" },
  { to: "/talleres", label: "Talleres" },
  { to: "/fesmica", label: "Festival" },
  { to: "/aliados", label: "Aliados" },
  { to: "/equipo", label: "Equipo" },
  { to: "/noticias", label: "Noticias" },
  { to: "/contacto", label: "Contacto" },
];

const legalLinks = [
  { to: "/terminos", label: "Términos y condiciones" },
  { to: "/libro-de-reclamaciones", label: "Libro de Reclamaciones" },
];

export function Footer() {
  return (
    <footer id="contacto" className="bg-negro">
      {/* CTA bloque */}
      <div className="bg-rojo py-20 lg:py-28 px-6 text-center">
        <p className="font-body text-negro uppercase tracking-[0.4em] text-xs mb-6">
          Última llamada
        </p>
        <h2 className="font-display text-negro text-5xl md:text-7xl lg:text-[88px] leading-[0.9] mb-8 max-w-4xl mx-auto">
          ¿LISTO PARA SUBIR<br />AL ESCENARIO?
        </h2>
        <p className="font-body text-negro/80 text-lg mb-10">
          Únete a la Familia Chaplin.
        </p>
        <a
          href="https://wa.me/51956060826"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-negro"
        >
          Escríbenos ahora
        </a>
      </div>

      {/* Footer principal */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 grain relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <Link to="/" className="inline-block mb-6 group">
              <div className="relative flex items-center justify-center w-40">
                {/* Halo cálido — igual que en el escenario del hero */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "150%",
                    height: "150%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background:
                      "radial-gradient(ellipse at center, rgba(255,240,210,0.55) 0%, rgba(255,220,170,0.25) 45%, transparent 70%)",
                  }}
                />
                <img
                  src="/logo-chaplin.png"
                  alt="Chaplin Grupo Cultural"
                  className="h-16 w-auto object-contain relative z-10 transition-opacity duration-300 group-hover:opacity-80"
                />
              </div>
            </Link>
            <p className="font-body text-blanco/60 text-sm leading-[1.8] max-w-xs">
              Teatro que transforma desde Ica. Una familia artística profesional
              al servicio de la escena peruana.
            </p>
          </div>

          <div>
            <h4 className="font-display text-rojo text-sm uppercase tracking-[0.3em] mb-6">
              Navegar
            </h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="font-body text-blanco/80 hover:text-rojo text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-rojo text-sm uppercase tracking-[0.3em] mb-6">
              Contacto
            </h4>
            <ul className="space-y-3 mb-8 font-body text-sm text-blanco/80">
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-rojo" />
                <a href="https://wa.me/51956060826" className="hover:text-rojo transition">
                  956 060 826
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram size={16} className="text-rojo" />
                <a
                  href="https://instagram.com/chaplin.grupocultural"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rojo transition"
                >
                  @chaplin.grupocultural
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Facebook size={16} className="text-rojo" />
                <a
                  href="https://www.facebook.com/profile.php?id=100063470896115&locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rojo transition"
                >
                  Chaplin Grupo Cultural
                </a>
              </li>
              <li className="flex items-center gap-3">
                <TikTokIcon size={16} className="text-rojo" />
                <a
                  href="https://www.tiktok.com/@chaplingrupocultural"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rojo transition"
                >
                  @chaplingrupocultural
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Youtube size={16} className="text-gris-humo" />
                <span className="text-blanco/40">YouTube — próximamente</span>
              </li>
            </ul>
            <p className="font-body text-blanco/50 text-xs">Ica · Perú</p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-gris-humo text-xs text-center md:text-left">
            Todos los derechos reservados © 2026. Desarrollada por Alejandro &amp; Jonathan López.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="font-body text-gris-humo hover:text-rojo text-xs transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
