"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ApiError,
  getTickets,
  type Ticket,
  type TicketList,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/supportApi";
import { useTicketFilters } from "@/store/TicketFiltersProvider";
import { TicketFilters } from "./TicketFilters";

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <tr>
      <td className="ticket-title-cell" data-label="Ticket">
        <Link href={`/tickets/${ticket.id}`}>{ticket.title}</Link>
        <span>#{ticket.id.slice(-6).toUpperCase()}</span>
      </td>
      <td data-label="Priority">
        <span className={`priority-label priority-${ticket.priority.toLowerCase()}`}>
          <span aria-hidden="true" />
          {PRIORITY_LABELS[ticket.priority]}
        </span>
      </td>
      <td data-label="Status">
        <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
          {STATUS_LABELS[ticket.status]}
        </span>
      </td>
      <td className="date-cell" data-label="Created">{formatDate(ticket.createdAt)}</td>
      <td className="row-action-cell">
        <Link className="row-action" href={`/tickets/${ticket.id}`} aria-label={`Open ${ticket.title}`}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>
        </Link>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="table-skeleton" aria-label="Loading tickets">
      {[0, 1, 2, 3, 4].map((item) => <span key={item} />)}
    </div>
  );
}

export function TicketTable() {
  const status = useTicketFilters((state) => state.status);
  const priority = useTicketFilters((state) => state.priority);
  const page = useTicketFilters((state) => state.page);
  const setPage = useTicketFilters((state) => state.setPage);
  const clearFilters = useTicketFilters((state) => state.clearFilters);
  const [result, setResult] = useState<TicketList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getTickets(
      {
        status: status === "ALL" ? undefined : status,
        priority: priority === "ALL" ? undefined : priority,
        page,
      },
      controller.signal,
    )
      .then(setResult)
      .catch((caughtError: unknown) => {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") return;
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          window.location.assign("/login");
          return;
        }
        setError("We couldn’t load your tickets. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, priority, reloadKey, status]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const hasFilters = status !== "ALL" || priority !== "ALL";

  return (
    <section className="ticket-list-card" aria-labelledby="ticket-list-heading">
      <div className="ticket-list-toolbar">
        <div>
          <h2 id="ticket-list-heading">All requests</h2>
          <p>{result ? `${result.total} ticket${result.total === 1 ? "" : "s"}` : "Your submitted requests"}</p>
        </div>
        <TicketFilters />
      </div>

      {isLoading ? <TableSkeleton /> : null}

      {!isLoading && error ? (
        <div className="list-state">
          <span className="state-icon error-state" aria-hidden="true">!</span>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="secondary-button" onClick={() => setReloadKey((key) => key + 1)} type="button">
            Try again
          </button>
        </div>
      ) : null}

      {!isLoading && !error && result?.items.length === 0 ? (
        <div className="list-state">
          <span className="state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 5.5h14v13H5zM8 9h8M8 12h6" /></svg>
          </span>
          <h3>{hasFilters ? "No matching tickets" : "No tickets yet"}</h3>
          <p>{hasFilters ? "Try changing or clearing your filters." : "Create your first request and the IT team will take it from there."}</p>
          {hasFilters ? (
            <button className="secondary-button" onClick={clearFilters} type="button">Clear filters</button>
          ) : (
            <Link className="primary-button compact" href="/tickets/new">Create a request</Link>
          )}
        </div>
      ) : null}

      {!isLoading && !error && result && result.items.length > 0 ? (
        <div className="ticket-table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>{result.items.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)}</tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && !error && result && result.total > result.pageSize ? (
        <div className="pagination">
          <p>Page {page} of {totalPages}</p>
          <div>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} type="button">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12 4-6 6 6 6" /></svg>
              Previous
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} type="button">
              Next
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m8 4 6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
