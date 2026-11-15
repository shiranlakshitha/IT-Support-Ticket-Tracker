import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

function SupportMark() {
  return (
    <div className="support-mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" fill="none">
        <path d="M8.5 14.2a5.5 5.5 0 0 1 11 0v2.3" />
        <path d="M8.5 16.5H7.2a1.7 1.7 0 0 1-1.7-1.7v-1.2a1.7 1.7 0 0 1 1.7-1.7h1.3v4.6ZM19.5 16.5h1.3a1.7 1.7 0 0 0 1.7-1.7v-1.2a1.7 1.7 0 0 0-1.7-1.7h-1.3v4.6ZM19.5 16.4c0 2.4-1.6 4-4 4h-1" />
        <circle cx="13" cy="20.4" r="1.2" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-story" aria-label="Support desk introduction">
        <div className="story-grid" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="brand-lockup">
            <SupportMark />
            <span>Support Desk</span>
          </div>

          <div className="max-w-xl pb-10">
            <p className="story-kicker">Your workday, uninterrupted</p>
            <h1 className="story-heading">
              Get help. Stay informed. Keep moving.
            </h1>
            <p className="story-copy">
              One clear place to raise IT requests, follow every update, and get
              back to doing your best work.
            </p>

            <div className="story-status">
              <span className="status-dot" aria-hidden="true" />
              <span>Secure employee support portal</span>
            </div>
          </div>

          <p className="story-footnote">Internal IT · Secure access</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="mobile-brand">
          <SupportMark />
          <span>Support Desk</span>
        </div>

        <div className="login-card">
          <div>
            <p className="eyebrow">Employee portal</p>
            <h2 className="login-heading">Welcome back</h2>
            <p className="login-subheading">
              Sign in with your work account to manage your support requests.
            </p>
          </div>

          <LoginForm />

          <div className="security-note">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8.5 10V7.7a3.5 3.5 0 0 1 7 0V10" />
            </svg>
            <p>
              Your session is protected and will automatically expire after one
              hour.
            </p>
          </div>
        </div>

        <p className="login-footer">
          Need help signing in? Contact your IT administrator.
        </p>
      </section>
    </main>
  );
}
