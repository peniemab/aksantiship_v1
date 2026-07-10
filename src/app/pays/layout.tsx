"use client";

import { RequireAuth } from "@/components/RequireAuth";

export default function PaysLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
