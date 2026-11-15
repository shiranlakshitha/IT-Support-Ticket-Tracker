"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib/supportApi";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.3 0 8.5 5.2 8.5 5.2a11.7 11.7 0 0 1-2.2 2.8M6.2 6.2A14.5 14.5 0 0 0 3.5 9.2S6.7 14.4 12 14.4c.7 0 1.4-.1 2-.3" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M3.5 9.2S6.7 4 12 4s8.5 5.2 8.5 5.2-3.2 5.2-8.5 5.2S3.5 9.2 3.5 9.2Z" />
      <circle cx="12" cy="9.2" r="2.4" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      router.replace("/tickets");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        setError("The username or password you entered is incorrect.");
      } else {
        setError("We couldn’t sign you in. Check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="form-label" htmlFor="username">
          Username
        </label>
        <input
          autoComplete="username"
          autoFocus
          className="form-input"
          id="username"
          name="username"
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your username"
          required
          type="text"
          value={username}
        />
      </div>

      <div className="space-y-2">
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="form-input pr-12"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="password-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {error ? (
          <div className="error-message" role="alert">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.8v5.1M12 16.4h.01" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      <button
        className="submit-button"
        disabled={isSubmitting || !username || !password}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
