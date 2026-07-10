"use client";

import Image from "next/image";
import { useState } from "react";
import { PARTNERS, partnerLogoSrc, type Partner } from "@/lib/marketing";

/** Même zone d'affichage pour tous les logos (hauteur × largeur fixes). */
const LOGO_SLOT_CLASS =
  "relative h-10 w-[7rem] sm:h-11 sm:w-[7.5rem] md:h-11 md:w-[6.75rem] lg:h-14 lg:w-[8.5rem] xl:w-[9.25rem]";

function PartnerLogo({ partner }: { partner: Partner }) {
  const [failed, setFailed] = useState(false);
  const scale = partner.logoScale ?? 1;
  const blendMode = partner.logoBlendMode ?? "normal";

  if (!partner.logo || failed) {
    return (
      <div className={`${LOGO_SLOT_CLASS} flex items-center justify-center`}>
        <span className="text-center text-xs font-semibold leading-tight text-foreground/45">
          {partner.name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={[LOGO_SLOT_CLASS, partner.logoSlotClass ?? ""].filter(Boolean).join(" ")}
      title={partner.name}
    >
      <Image
        src={partnerLogoSrc(partner.logo)}
        alt={partner.name}
        fill
        unoptimized
        sizes="(max-width: 768px) 112px, (max-width: 1024px) 136px, 148px"
        className="object-contain object-center"
        style={{
          transform: `scale(${scale})`,
          filter: partner.logoFilter,
          mixBlendMode: blendMode,
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function PartnersSection() {
  return (
    <section id="partenaires" className="scroll-mt-24 bg-white pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-6 lg:pb-10">
      {/* Mêmes marges horizontales que le header (max-w-7xl + px-4/6/8) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-border px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-9">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Nos partenaires officiels
          </p>

          {/* Mobile 2×3 · Tablette & desktop : 6 logos en ligne */}
          <ul className="mx-auto mt-6 grid grid-cols-2 place-items-center gap-x-3 gap-y-8 md:grid-cols-6 md:gap-x-2 md:gap-y-0 lg:gap-x-3 xl:gap-x-5">
            {PARTNERS.map((partner) => (
              <li key={partner.id} className="flex items-center justify-center">
                <PartnerLogo partner={partner} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
