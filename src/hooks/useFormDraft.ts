"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Conserve un brouillon de formulaire dans sessionStorage (survit au F5).
 * Les clés dans `omitKeys` ne sont jamais persistées (ex. mots de passe).
 */
export function useFormDraft<T extends Record<string, string>>(
  storageKey: string,
  initial: T,
  omitKeys: readonly (keyof T)[] = [],
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const [form, setFormState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const omitRef = useRef(omitKeys);
  omitRef.current = omitKeys;
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>;
        setFormState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const toStore = { ...form };
    for (const key of omitRef.current) {
      delete toStore[key];
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch {
      /* ignore */
    }
  }, [form, hydrated, storageKey]);

  const setForm = (next: T | ((prev: T) => T)) => {
    setFormState(next);
  };

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setFormState(initialRef.current);
  };

  return [form, setForm, clearDraft];
}
