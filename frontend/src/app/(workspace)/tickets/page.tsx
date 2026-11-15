import type { Metadata } from "next";
import Link from "next/link";
import { TicketTable } from "@/components/TicketTable";

export const metadata: Metadata = {
  title: "My tickets",
};

export default function TicketsPage() {
  return (
    <main className="tickets-page">
      <div className="page-heading-row">
        <div>
          <p className="page-eyebrow">Support workspace</p>
          <h1>My tickets</h1>
          <p className="page-description">Track your requests and stay up to date with the IT team.</p>
        </div>
        <Link className="primary-button new-ticket-button" href="/tickets/new">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
          New request
        </Link>
      </div>
      <TicketTable />
    </main>
  );
}
