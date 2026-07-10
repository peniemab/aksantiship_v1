import Image from "next/image";
import { AppButton } from "@/components/ui/AppButton";
import { HeroRadarBackdrop } from "@/components/marketing/HeroRadarDecor";
import { HERO_STATS } from "@/lib/marketing";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-ship-orange/[0.04] to-aksanti-red/[0.06]">
      <HeroRadarBackdrop />
      <div className="absolute -right-24 top-10 size-72 rounded-full bg-aksanti-red/8 blur-3xl" />
      <div className="absolute bottom-0 left-0 size-56 rounded-full bg-ship-orange/12 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(26,26,46,0.06) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20 lg:pb-14">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Trouvez la bourse d&apos;études{" "}
            <span className="text-aksanti-red">faite pour vous</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Aksantiship analyse votre profil et vous accompagne jusqu&apos;à l&apos;obtention
            de votre bourse.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AppButton href="/auth/inscription" variant="primary">
              Trouver mes bourses
            </AppButton>
            <AppButton href="/#comment-ca-marche" variant="secondary">
              Comment ça marche ?
              <span aria-hidden>→</span>
            </AppButton>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["A", "M", "K", "S"].map((initial) => (
                <span
                  key={initial}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-aksanti-red to-ship-orange text-xs font-bold text-white"
                >
                  {initial}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted">
              <strong className="text-foreground">10 000+</strong> étudiants déjà accompagnés
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] overflow-visible lg:max-w-[26rem]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-aksanti-red/25 via-aksanti-red/10 to-transparent" />
            <div className="absolute inset-3 rounded-full border-2 border-aksanti-red/30 bg-white shadow-[var(--card-shadow)]" />
            <div className="absolute inset-6 overflow-hidden rounded-full">
              <Image
                src="/hero-student.png"
                alt="Étudiante souriante avec sac à dos, prête pour ses études à l'étranger"
                fill
                className="object-cover object-[center_20%]"
                sizes="(max-width: 1024px) 22rem, 26rem"
                priority
              />
            </div>

            {HERO_STATS.map((stat, i) => {
              const positions = [
                "-left-2 top-6 sm:left-0",
                "-right-2 top-1/4 sm:right-0",
                "bottom-6 left-2 sm:bottom-8 sm:left-4",
              ];
              return (
                <div
                  key={stat.label}
                  className={`absolute ${positions[i]} z-10 max-w-[9rem] rounded-2xl border border-border bg-white/95 p-3 shadow-[var(--card-shadow)] backdrop-blur-sm`}
                >
                  <p className="text-lg font-extrabold text-aksanti-red">{stat.value}</p>
                  <p className="text-[11px] leading-snug text-muted">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
