import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";
import heroPoster from "@/assets/hero-poster.jpg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef  = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".hero-logo-stage", {
          opacity: 0,
          scale: 0.8,
          duration: 1.4,
          ease: "power3.out",
          delay: 0.2,
        })
        .from(
          ".hero-title-word",
          { yPercent: 110, duration: 1.2, stagger: 0.08, ease: "power3.out" },
          "-=0.8"
        )
        .from(
          ".hero-sub",
          { opacity: 0, y: 20, duration: 1, ease: "power2.out" },
          "-=0.6"
        )
        .from(
          ".hero-cta",
          { opacity: 0, y: 20, duration: 0.8, stagger: 0.15, ease: "power2.out" },
          "-=0.4"
        );

      // Parallax al hacer scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=150%",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (contentRef.current) {
            contentRef.current.style.opacity   = String(1 - p * 2);
            contentRef.current.style.transform = `translateY(${p * -40}px) scale(${1 - p * 0.05})`;
          }
          if (stageRef.current) {
            stageRef.current.style.transform = `scale(${1 + p * 0.12})`;
          }
          if (overlayRef.current) {
            overlayRef.current.style.opacity = String(Math.min(p * 1.3, 0.9));
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-negro"
    >
      {/* Escenario */}
      <div
        ref={stageRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${heroPoster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroPoster}
          className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-90"
        />

        {/* Vignette perimetral */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.95)_100%)]" />

        {/* ── Logo sobre el escenario, iluminado por el foco ── */}
        <div className="hero-logo-stage absolute bottom-[5%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Halo cálido que simula el foco de luz */}
            <div
              className="absolute rounded-full"
              style={{
                width: "140%",
                height: "140%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(ellipse at center, rgba(255,240,210,0.60) 0%, rgba(255,220,170,0.30) 40%, transparent 70%)",
              }}
            />
            {/* Logo en sus colores naturales */}
            <img
              src="/logo-chaplin.png"
              alt="Chaplin Grupo Cultural"
              className="w-40 sm:w-52 md:w-64 lg:w-80 select-none relative z-10"
            />
          </div>
        </div>
      </div>

      {/* Overlay oscuro que aparece al hacer scroll */}
      <div ref={overlayRef} className="absolute inset-0 bg-negro opacity-0 z-10" />

      {/* Contenido de texto */}
      <div
        ref={contentRef}
        className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <p className="hero-sub font-body text-rojo text-xs md:text-sm uppercase tracking-[0.4em] mb-6">
          Desde Ica para el Perú
        </p>

        <h1 className="font-display text-blanco text-[52px] sm:text-[76px] md:text-[105px] lg:text-[136px] leading-[0.9] tracking-[0.04em] mb-2 overflow-hidden">
          <span className="inline-block overflow-hidden">
            <span className="hero-title-word inline-block">TEATRO</span>
          </span>{" "}
          <span className="inline-block overflow-hidden">
            <span className="hero-title-word inline-block text-rojo">QUE</span>
          </span>{" "}
          <span className="inline-block overflow-hidden">
            <span className="hero-title-word inline-block">TRANSFORMA</span>
          </span>
        </h1>

        <p className="hero-sub max-w-xl font-body text-blanco/70 text-sm md:text-base mt-4 mb-10">
          El escenario es nuestro hogar. Ica, nuestra razón.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a href="#proxima" className="hero-cta btn-rojo">
            Ver próximas funciones
          </a>
          <Link to="/nosotros" className="hero-cta btn-outline">
            Conoce Chaplin
          </Link>
        </div>
      </div>
    </section>
  );
}
