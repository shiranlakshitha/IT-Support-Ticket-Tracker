"use client";

import * as Select from "@radix-ui/react-select";
import { useTicketFilters } from "@/store/TicketFiltersProvider";
import type { TicketPriority, TicketStatus } from "@/lib/supportApi";

type FilterValue = TicketStatus | TicketPriority | "ALL";

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m6 8 4 4 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 10 3 3 7-7" />
    </svg>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: FilterValue;
  onValueChange: (value: FilterValue) => void;
  items: Array<{ value: FilterValue; label: string }>;
}) {
  return (
    <div className="filter-field">
      <label>{label}</label>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger className="select-trigger" aria-label={label}>
          <Select.Value />
          <Select.Icon className="select-chevron"><ChevronIcon /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="select-content" position="popper" sideOffset={6}>
            <Select.Viewport>
              {items.map((item) => (
                <Select.Item className="select-item" key={item.value} value={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator className="select-check"><CheckIcon /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function TicketFilters() {
  const status = useTicketFilters((state) => state.status);
  const priority = useTicketFilters((state) => state.priority);
  const setStatus = useTicketFilters((state) => state.setStatus);
  const setPriority = useTicketFilters((state) => state.setPriority);
  const clearFilters = useTicketFilters((state) => state.clearFilters);
  const hasFilters = status !== "ALL" || priority !== "ALL";

  return (
    <div className="ticket-filters">
      <div className="filter-group">
        <FilterSelect
          label="Status"
          value={status}
          onValueChange={(value) => setStatus(value as TicketStatus | "ALL")}
          items={[
            { value: "ALL", label: "All statuses" },
            { value: "OPEN", label: "Open" },
            { value: "IN_PROGRESS", label: "In progress" },
            { value: "RESOLVED", label: "Resolved" },
          ]}
        />
        <FilterSelect
          label="Priority"
          value={priority}
          onValueChange={(value) => setPriority(value as TicketPriority | "ALL")}
          items={[
            { value: "ALL", label: "All priorities" },
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
        />
      </div>
      {hasFilters ? (
        <button className="clear-filters" onClick={clearFilters} type="button">
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
