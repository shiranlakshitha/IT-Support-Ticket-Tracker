import { createStore } from "zustand/vanilla";
import type { TicketPriority, TicketStatus } from "@/lib/supportApi";

export type TicketFilterState = {
  status: TicketStatus | "ALL";
  priority: TicketPriority | "ALL";
  page: number;
  setStatus: (status: TicketStatus | "ALL") => void;
  setPriority: (priority: TicketPriority | "ALL") => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
};

export function createTicketFiltersStore() {
  return createStore<TicketFilterState>((set) => ({
    status: "ALL",
    priority: "ALL",
    page: 1,
    setStatus: (status) => set({ status, page: 1 }),
    setPriority: (priority) => set({ priority, page: 1 }),
    setPage: (page) => set({ page }),
    clearFilters: () => set({ status: "ALL", priority: "ALL", page: 1 }),
  }));
}

export type TicketFiltersStore = ReturnType<typeof createTicketFiltersStore>;
