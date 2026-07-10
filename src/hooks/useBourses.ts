"use client";

import { fetchBourses } from "@/lib/bourses/client";
import type { BourseWithMatch, BoursesQueryParams } from "@/lib/bourses/types";
import { useCallback, useEffect, useState } from "react";

interface UseBoursesResult {
  bourses: BourseWithMatch[];
  meta: { total: number; returned: number; matched?: number; excluded?: number; countries?: string[]; sources?: { total: number; curated: number; catalog: number; china: number; france: number; germany: number; belgium: number; canada: number; japan: number; synced: number } } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBourses(params: BoursesQueryParams = {}): UseBoursesResult {
  const [bourses, setBourses] = useState<BourseWithMatch[]>([]);
  const [meta, setMeta] = useState<UseBoursesResult["meta"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBourses(params);
      setBourses(response.data);
      setMeta(response.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les bourses.");
      setBourses([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { bourses, meta, loading, error, refetch: load };
}
