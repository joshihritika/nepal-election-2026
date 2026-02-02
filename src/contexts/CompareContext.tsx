"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "compare-candidates";

interface CompareContextType {
  selectedIds: string[];
  addCandidate: (id: string) => void;
  removeCandidate: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {}
  }, [selectedIds]);

  const addCandidate = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const removeCandidate = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearAll = useCallback(() => setSelectedIds([]), []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  return (
    <CompareContext.Provider
      value={{
        selectedIds,
        addCandidate,
        removeCandidate,
        clearAll,
        isSelected,
        canAdd: selectedIds.length < MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
