import type { CookieOptions } from "express";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

export function accessTokenCookieOptions(appOrigin: string): CookieOptions {
  return {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    path: "/api",
    sameSite: "lax",
    secure: new URL(appOrigin).protocol === "https:",
  };
}

export function clearAccessTokenCookieOptions(appOrigin: string): CookieOptions {
  const { maxAge: _maxAge, ...options } = accessTokenCookieOptions(appOrigin);
  return options;
}
