"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/lib/dashboard-navigation";
import { DashboardIcon } from "./DashboardIcon";

function isDashboardActive(pathname: string, href: string): boolean {
  const base = href.split("#")[0];
  if (base === "/tableau-de-bord") return pathname === "/tableau-de-bord";
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="text-lg font-extrabold text-aksanti-red">
          Aksantiship
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {DASHBOARD_NAV.map((item) => {
          const active = isDashboardActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-aksanti-red/10 text-aksanti-red"
                  : "text-foreground/70 hover:bg-surface hover:text-foreground",
              ].join(" ")}
            >
              <DashboardIcon name={item.icon} className="size-5 shrink-0 opacity-80" />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
                  Bientôt
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/abonnement"
          className="flex w-full items-center justify-center rounded-full bg-aksanti-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-aksanti-red-dark"
        >
          Passer Premium
        </Link>
      </div>
    </aside>
  );
}
