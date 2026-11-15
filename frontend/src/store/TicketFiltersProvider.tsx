"use client";

import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import {
  createTicketFiltersStore,
  type TicketFilterState,
  type TicketFiltersStore,
} from "./ticketFiltersStore";

const TicketFiltersContext = createContext<TicketFiltersStore | null>(null);

export function TicketFiltersProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<TicketFiltersStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createTicketFiltersStore();
  }

  return (
    <TicketFiltersContext.Provider value={storeRef.current}>
      {children}
    </TicketFiltersContext.Provider>
  );
}

export function useTicketFilters<T>(
  selector: (state: TicketFilterState) => T,
): T {
  const store = useContext(TicketFiltersContext);

  if (!store) {
    throw new Error("useTicketFilters must be used within TicketFiltersProvider");
  }

  return useStore(store, selector);
}
