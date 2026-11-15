"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getTicket,
  updateTicketStatus,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/supportApi";

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

function formatDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function DetailSkeleton() {
  return (
    <div className="detail-skeleton" aria-label="Loading ticket">
      <span className="detail-skeleton-line short" />
      <span className="detail-skeleton-line heading" />
      <div className="detail-skeleton-grid">
        <div><span /><span /><span /><span /></div>
        <div><span /><span /><span /></div>
      </div>
    </div>
  );
}

function DetailError({ notFound, onRetry }: { notFound: boolean; onRetry: () => void }) {
  return (
    <div className="detail-state">
      <span className="state-icon error-state" aria-hidden="true">!</span>
      <h1>{notFound ? "Ticket not found" : "We couldn’t load this ticket"}</h1>
      <p>
        {notFound
          ? "This ticket may have been removed, or you may not have access to it."
          : "Check your connection and try opening the ticket again."}
      </p>
      {notFound ? (
        <Link className="primary-button compact" href="/tickets">Back to my tickets</Link>
      ) : (
        <button className="primary-button compact" onClick={onRetry} type="button">Try again</button>
      )}
    </div>
  );
}

export function TicketDetails({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadTicket = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(false);
    setNotFound(false);

    try {
      setTicket(await getTicket(ticketId, signal));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (error instanceof ApiError && error.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(true);
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadTicket(controller.signal);
    return () => controller.abort();
  }, [loadTicket, reloadKey]);

  async function handleStatusUpdate() {
    if (!ticket || ticket.status === "RESOLVED") return;

    const nextStatus: TicketStatus = ticket.status === "OPEN" ? "IN_PROGRESS" : "RESOLVED";
    setActionError(null);
    setIsUpdating(true);

    try {
      setTicket(await updateTicketStatus(ticket.id, nextStatus));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (error instanceof ApiError && error.status === 409) {
        try {
          setTicket(await getTicket(ticket.id));
        } catch {}
        setActionError("The ticket changed while you were viewing it. Its current status is shown now.");
      } else {
        setActionError("We couldn’t update the status. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) return <DetailSkeleton />;
  if (notFound || loadError || !ticket) {
    return <DetailError notFound={notFound} onRetry={() => setReloadKey((key) => key + 1)} />;
  }

  const statusStep = ticket.status === "OPEN" ? 1 : ticket.status === "IN_PROGRESS" ? 2 : 3;
  const actionLabel = ticket.status === "OPEN" ? "Start progress" : "Resolve ticket";

  return (
    <main className="ticket-detail-page">
      <Link className="back-link" href="/tickets">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12 4-6 6 6 6" /></svg>
        Back to my tickets
      </Link>

      <div className="ticket-detail-heading">
        <div className="detail-title-meta">
          <span>Ticket #{ticket.id.slice(-6).toUpperCase()}</span>
          <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
            {STATUS_LABELS[ticket.status]}
          </span>
        </div>
        <h1>{ticket.title}</h1>
        <p>Submitted {formatDate(ticket.createdAt, true)}</p>
      </div>

      <div className="ticket-detail-layout">
        <div className="ticket-detail-main">
          <section className="detail-card detail-description" aria-labelledby="description-heading">
            <div className="detail-card-heading">
              <span className="detail-heading-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 5.5h14v13H8l-3 2v-15ZM8.5 9h7M8.5 12.5h5" /></svg>
              </span>
              <div>
                <h2 id="description-heading">Issue description</h2>
                <p>Details provided with this request</p>
              </div>
            </div>
            <p className="ticket-description-copy">{ticket.description}</p>
          </section>

          <section className="detail-card detail-activity" aria-labelledby="activity-heading">
            <div className="detail-card-heading">
              <span className="detail-heading-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2" /></svg>
              </span>
              <div>
                <h2 id="activity-heading">Ticket progress</h2>
                <p>Follow this request through each stage</p>
              </div>
            </div>

            <ol className="status-timeline">
              <li className="complete">
                <span><svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 3 7-7" /></svg></span>
                <div><strong>Request submitted</strong><p>{formatDate(ticket.createdAt, true)}</p></div>
              </li>
              <li className={statusStep >= 2 ? "complete" : "pending"}>
                <span>{statusStep >= 2 ? <svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 3 7-7" /></svg> : "2"}</span>
                <div><strong>In progress</strong><p>{statusStep >= 2 ? "The IT team is working on this request." : "Waiting for an IT agent to begin work."}</p></div>
              </li>
              <li className={statusStep >= 3 ? "complete" : "pending"}>
                <span>{statusStep >= 3 ? <svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 3 7-7" /></svg> : "3"}</span>
                <div><strong>Resolved</strong><p>{statusStep >= 3 ? `Completed ${formatDate(ticket.updatedAt, true)}` : "The request will be closed after resolution."}</p></div>
              </li>
            </ol>
          </section>
        </div>

        <aside className="ticket-detail-sidebar">
          <section className="detail-card status-action-card">
            <p className="detail-sidebar-label">Current status</p>
            <div className={`current-status current-status-${ticket.status.toLowerCase()}`}>
              <span aria-hidden="true" />
              <div><strong>{STATUS_LABELS[ticket.status]}</strong><small>{ticket.status === "OPEN" ? "Waiting to be picked up" : ticket.status === "IN_PROGRESS" ? "An agent is working on it" : "This request is complete"}</small></div>
            </div>
            {ticket.status !== "RESOLVED" ? (
              <button
                className="primary-button status-action-button"
                disabled={isUpdating}
                onClick={() => void handleStatusUpdate()}
                type="button"
              >
                {isUpdating ? <><span className="spinner" aria-hidden="true" />Updating…</> : <>{actionLabel}<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg></>}
              </button>
            ) : (
              <div className="resolved-note">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 10 3 3 7-7" /></svg>
                No further action is needed.
              </div>
            )}
            {actionError ? <p className="status-action-error" role="alert">{actionError}</p> : null}
          </section>

          <section className="detail-card ticket-details-card">
            <h2>Ticket details</h2>
            <dl>
              <div><dt>Priority</dt><dd><span className={`priority-label priority-${ticket.priority.toLowerCase()}`}><span aria-hidden="true" />{PRIORITY_LABELS[ticket.priority]}</span></dd></div>
              <div><dt>Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDate(ticket.updatedAt)}</dd></div>
              <div><dt>Ticket ID</dt><dd className="ticket-id-value">#{ticket.id.slice(-6).toUpperCase()}</dd></div>
            </dl>
          </section>

          <div className="detail-help-note">
            <span aria-hidden="true">?</span>
            <p><strong>Need to add more information?</strong>Call the IT service desk on extension 4400 and quote your ticket ID.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
