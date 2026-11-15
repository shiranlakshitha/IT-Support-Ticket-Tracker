"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getCurrentUser,
  logout,
  type AuthUser,
} from "@/lib/supportApi";
import { TicketFiltersProvider } from "@/store/TicketFiltersProvider";

function BrandMark() {
  return (
    <span className="workspace-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" fill="none">
        <path d="M8.5 14.2a5.5 5.5 0 0 1 11 0v2.3" />
        <path d="M8.5 16.5H7.2a1.7 1.7 0 0 1-1.7-1.7v-1.2a1.7 1.7 0 0 1 1.7-1.7h1.3v4.6ZM19.5 16.5h1.3a1.7 1.7 0 0 0 1.7-1.7v-1.2a1.7 1.7 0 0 0-1.7-1.7h-1.3v4.6ZM19.5 16.4c0 2.4-1.6 4-4 4h-1" />
        <circle cx="13" cy="20.4" r="1.2" />
      </svg>
    </span>
  );
}

function TicketsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 5.5h15v13h-15zM8 9h8M8 12h8M8 15h5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const checkSession = useCallback(async () => {
    setAuthError(false);
    setIsChecking(true);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }
      setAuthError(true);
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
      setUser(null);
      router.replace("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  if (isChecking) {
    return (
      <main className="workspace-gate" aria-live="polite">
        <span className="workspace-spinner" aria-hidden="true" />
        <p>Opening your support workspace…</p>
      </main>
    );
  }

  if (authError || !user) {
    return (
      <main className="workspace-gate">
        <div className="gate-card">
          <span className="gate-icon" aria-hidden="true">!</span>
          <h1>We couldn’t reach the support desk</h1>
          <p>Check your connection and try opening your workspace again.</p>
          <button className="primary-button" onClick={() => void checkSession()} type="button">
            Try again
          </button>
        </div>
      </main>
    );
  }

  const displayName = user.email.split("@")[0].replace(/[._-]+/g, " ");
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TicketFiltersProvider>
      <div className="workspace-shell">
        <aside className="workspace-sidebar">
          <Link className="workspace-brand" href="/tickets">
            <BrandMark />
            <span>Support Desk</span>
          </Link>

          <nav className="workspace-nav" aria-label="Support navigation">
            <p className="nav-label">Workspace</p>
            <Link
              className={`nav-link ${pathname === "/tickets" ? "active" : ""}`}
              href="/tickets"
            >
              <TicketsIcon />
              My tickets
            </Link>
            <Link
              className={`nav-link ${pathname === "/tickets/new" ? "active" : ""}`}
              href="/tickets/new"
            >
              <PlusIcon />
              New request
            </Link>
          </nav>

          <div className="sidebar-help">
            <span className="sidebar-help-icon" aria-hidden="true">?</span>
            <div>
              <strong>Need urgent help?</strong>
              <p>Call the IT service desk on extension 4400.</p>
            </div>
          </div>

          <div className="sidebar-user">
            <span className="user-avatar">{initials || "U"}</span>
            <div className="user-meta">
              <strong className="capitalize">{displayName}</strong>
              <span title={user.email}>{user.email}</span>
            </div>
            <button
              aria-label="Sign out"
              className="logout-button"
              disabled={isSigningOut}
              onClick={() => void handleLogout()}
              title="Sign out"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M10 5H5.5v14H10M14.5 8l4 4-4 4M9 12h9" />
              </svg>
            </button>
          </div>
        </aside>

        <div className="workspace-main">
          <header className="workspace-mobile-header">
            <Link className="workspace-brand" href="/tickets">
              <BrandMark />
              <span>Support Desk</span>
            </Link>
            <Link className="mobile-new-button" href="/tickets/new" aria-label="New request">
              <PlusIcon />
            </Link>
          </header>
          {children}
        </div>
      </div>
    </TicketFiltersProvider>
  );
}
