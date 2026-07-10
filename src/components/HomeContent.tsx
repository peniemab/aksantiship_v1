"use client";

import { LandingHero } from "@/components/marketing/LandingHero";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { PartnersSection } from "@/components/marketing/PartnersSection";

export function HomeContent() {
  return (
    <>
      <LandingHero />
      <PartnersSection />
      <HowItWorksSection />
    </>
  );
}
