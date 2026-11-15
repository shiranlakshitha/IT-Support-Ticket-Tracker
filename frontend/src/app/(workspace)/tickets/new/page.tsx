import type { Metadata } from "next";
import Link from "next/link";
import { TicketForm } from "@/components/TicketForm";

export const metadata: Metadata = {
  title: "New request",
};

export default function NewTicketPage() {
  return (
    <main className="new-ticket-page">
      <Link className="back-link" href="/tickets">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12 4-6 6 6 6" /></svg>
        Back to my tickets
      </Link>

      <div className="new-ticket-heading">
        <p className="page-eyebrow">New support request</p>
        <h1>How can we help?</h1>
        <p>Share the details below and we’ll make sure your request reaches the right person.</p>
      </div>

      <div className="new-ticket-layout">
        <TicketForm />

        <aside className="request-guide" aria-label="What happens next">
          <div className="request-guide-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2" /></svg>
          </div>
          <h2>What happens next?</h2>
          <ol>
            <li><span>1</span><p><strong>We review your request</strong>Your ticket is sent to the IT service desk.</p></li>
            <li><span>2</span><p><strong>An agent gets in touch</strong>We may contact you for more details.</p></li>
            <li><span>3</span><p><strong>Follow progress here</strong>Status updates appear in your ticket list.</p></li>
          </ol>
          <div className="guide-note">
            <strong>Is this urgent?</strong>
            <p>Call the IT service desk on extension 4400 for critical outages.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
