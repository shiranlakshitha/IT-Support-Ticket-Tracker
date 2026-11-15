"use client";

import * as Select from "@radix-ui/react-select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ApiError,
  createTicket,
  type TicketPriority,
} from "@/lib/supportApi";

const PRIORITIES: Array<{
  value: TicketPriority;
  label: string;
  description: string;
}> = [
  { value: "LOW", label: "Low", description: "General question or minor inconvenience" },
  { value: "MEDIUM", label: "Medium", description: "Work is affected, but a workaround exists" },
  { value: "HIGH", label: "High", description: "Work is blocked or a critical service is down" },
];

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

export function TicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const isValid =
    trimmedTitle.length >= 3 &&
    trimmedTitle.length <= 100 &&
    trimmedDescription.length >= 10 &&
    trimmedDescription.length <= 1000;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await createTicket({
        title: trimmedTitle,
        description: trimmedDescription,
        priority,
      });
      router.push("/tickets");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        router.replace("/login");
        return;
      }
      if (caughtError instanceof ApiError && caughtError.status === 400) {
        setError(caughtError.message);
      } else {
        setError("We couldn’t create your ticket. Check your connection and try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form className="new-ticket-form" onSubmit={handleSubmit}>
      <div className="ticket-form-section">
        <div className="form-section-heading">
          <span>1</span>
          <div>
            <h2>Tell us what happened</h2>
            <p>A clear summary helps the IT team respond faster.</p>
          </div>
        </div>

        <div className="ticket-form-fields">
          <div className="ticket-form-field">
            <div className="field-label-row">
              <label htmlFor="ticket-title">Title</label>
              <span>{title.length}/100</span>
            </div>
            <input
              autoFocus
              id="ticket-title"
              maxLength={100}
              minLength={3}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Briefly describe the issue"
              required
              type="text"
              value={title}
            />
            <p className="field-hint">For example: “Office printer is showing as offline”</p>
          </div>

          <div className="ticket-form-field">
            <div className="field-label-row">
              <label htmlFor="ticket-description">Description</label>
              <span>{description.length}/1000</span>
            </div>
            <textarea
              id="ticket-description"
              maxLength={1000}
              minLength={10}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What were you trying to do? Include any error messages and steps you’ve already tried."
              required
              rows={7}
              value={description}
            />
            <p className="field-hint">Please don’t include passwords or other sensitive information.</p>
          </div>
        </div>
      </div>

      <div className="ticket-form-section">
        <div className="form-section-heading">
          <span>2</span>
          <div>
            <h2>Choose a priority</h2>
            <p>Tell us how much this issue is affecting your work.</p>
          </div>
        </div>

        <div className="ticket-form-fields">
          <div className="ticket-form-field">
            <label htmlFor="ticket-priority">Priority</label>
            <Select.Root
              value={priority}
              onValueChange={(value) => setPriority(value as TicketPriority)}
            >
              <Select.Trigger className="priority-select-trigger" id="ticket-priority">
                <Select.Value>
                  <span className={`priority-select-value priority-value-${priority.toLowerCase()}`}>
                    <i aria-hidden="true" />
                    <span>
                      <strong>{PRIORITIES.find((item) => item.value === priority)?.label}</strong>
                      <small>{PRIORITIES.find((item) => item.value === priority)?.description}</small>
                    </span>
                  </span>
                </Select.Value>
                <Select.Icon className="priority-select-chevron"><ChevronIcon /></Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="priority-select-content" position="popper" sideOffset={6}>
                  <Select.Viewport>
                    {PRIORITIES.map((item) => (
                      <Select.Item
                        className="priority-select-item"
                        key={item.value}
                        value={item.value}
                      >
                        <Select.ItemText>
                          <span className={`priority-select-value priority-value-${item.value.toLowerCase()}`}>
                            <i aria-hidden="true" />
                            <span>
                              <strong>{item.label}</strong>
                              <small>{item.description}</small>
                            </span>
                          </span>
                        </Select.ItemText>
                        <Select.ItemIndicator className="priority-select-check"><CheckIcon /></Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>
      </div>

      {error ? (
        <div className="ticket-form-error" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      ) : null}

      <div className="ticket-form-actions">
        <Link className="form-cancel-button" href="/tickets">Cancel</Link>
        <button className="primary-button ticket-submit-button" disabled={!isValid || isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Creating ticket…
            </>
          ) : (
            <>
              Create ticket
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
