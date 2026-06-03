import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  bg?: string;
  dark?: boolean;
}

export function PageHero({ eyebrow, title, subtitle, bg, dark = true }: PageHeroProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ph-fade", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.from(".ph-line", {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.7,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const textColor = dark ? "text-blanco" : "text-negro";
  const subColor = dark ? "text-blanco/60" : "text-negro/60";
  const bg_ = dark ? "bg-negro grain" : "bg-gris-claro";

  return (
    <section ref={ref} className={`relative pt-44 pb-20 lg:pt-52 lg:pb-28 overflow-hidden ${bg_}`}>
      {bg && (
        <>
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 bg-negro/78" />
        </>
      )}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <p className="ph-fade font-body uppercase tracking-[0.4em] text-rojo text-xs mb-6">
          {eyebrow}
        </p>
        <h1 className={`ph-fade font-display ${textColor} text-[56px] md:text-[80px] lg:text-[108px] leading-[0.9] mb-6`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`ph-fade font-body ${subColor} text-base md:text-lg max-w-2xl leading-[1.8]`}>
            {subtitle}
          </p>
        )}
        <div className="ph-line linea-roja mt-8" style={{ transformOrigin: "left center" }} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-rojo/20" />
    </section>
  );
}
