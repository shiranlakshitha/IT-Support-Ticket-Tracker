# IT Support Ticket Tracker — Backend

Use one NestJS app with the default Express adapter, TypeScript, and Mongoose. Keep controllers responsible for HTTP, services responsible for ticket and login rules, and Mongoose models responsible for persistence.

## Suggested backend structure

```text
backend/
  src/
    main.ts
    app.module.ts
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      jwt-auth.guard.ts
      origin.guard.ts
      dto/login.dto.ts
      schemas/user.schema.ts
    tickets/
      tickets.module.ts
      tickets.controller.ts
      tickets.service.ts
      dto/
      schemas/ticket.schema.ts
    scripts/seed-user.ts
```

## JWT login

1. Use a seed script to create demo accounts with Argon2id password hashes. Supply email and password through local environment variables and keep the real values out of Git. Each account manages its own tickets.
2. On login, trim and lowercase the email, look up the user, and verify the password against the stored hash. Return a generic `401` for invalid credentials.
3. Sign a JWT via `@nestjs/jwt`. Set `sub` to the user's ID and expire the token after one hour. Read `JWT_SECRET` from the NestJS environment.
4. Set the JWT in the `access_token` cookie with `HttpOnly`, `SameSite=Lax`, `Path=/api`, and a lifetime matching the JWT. Use `Secure` on HTTPS deployments and leave it off for local HTTP. Omit the `Domain` attribute. Return only `{ id, email }` in the login response.
5. Register `cookie-parser` and use one JWT guard for `/auth/me` and ticket routes. Verify signature and expiration, and derive ticket ownership from the verified `sub`. Set `Cache-Control: no-store` on API responses.
6. Send API calls through the frontend origin. For `POST` and `PATCH`, check that the request's `Origin` matches `APP_ORIGIN` exactly. Return `403` for a missing or mismatched origin. Keep the NestJS origin private in a deployed demo.
7. Logout clears the cookie with the same name, path, and scope. Allow logout when the token has expired so the browser can still clear its cookie. After expiration, the user signs in again.

## API contract

Set the global prefix to `api`. Successful responses use the shapes below. All routes under `/api/tickets` require the JWT cookie.

| Method and path | Input | Success |
| --- | --- | --- |
| `POST /api/auth/login` | `{ email, password }` | `200`, sets cookie and returns `{ id, email }` |
| `GET /api/auth/me` | JWT cookie | `200`, returns `{ id, email }` |
| `POST /api/auth/logout` | Empty body | `204`, clears cookie |
| `GET /api/tickets` | Optional `status`, `priority`, `page` query parameters | `200`, returns `{ items, page, pageSize, total }` |
| `POST /api/tickets` | `{ title, description, priority }` | `201`, returns the created ticket |
| `GET /api/tickets/:id` | Ticket ID | `200`, returns the ticket |
| `PATCH /api/tickets/:id/status` | `{ status }` | `200`, returns the updated ticket |

A ticket response contains `id`, `title`, `description`, `priority`, `status`, `createdAt`, and `updatedAt`. Serialize IDs as strings and dates as UTC ISO 8601 strings. List results use the same shape, newest first by `createdAt` with `_id` as a tie-breaker. Page starts at 1, page size is 20, and total counts the signed-in user's tickets matching the current filters.

## Validation and ticket rules

- Use NestJS DTOs and a global validation pipe. Reject unknown input fields, invalid enum values, malformed ticket IDs, and invalid page numbers with `400`. Trim ticket text before checking its length.
- Require 3–100 characters for the title and 10–1,000 for the description. Priority accepts `LOW`, `MEDIUM`, or `HIGH`. Every new ticket starts as `OPEN`.
- Scope every list, count, read, and update by `createdBy` using the signed-in user's ID. A missing ticket or a ticket owned by another account returns the same `404`.
- Allow `OPEN` → `IN_PROGRESS` → `RESOLVED`. Return `200` with the current ticket on an identical status request. Return `409` for a skipped or backward step.
- For a status change, include the ID, owner ID, and previously read status in the atomic update filter. If it matches no document, read the current owner-scoped record again and return `200` if it already has the requested status, `404` if missing, or `409` otherwise.

## Local environment

| Variable | Example or purpose |
| --- | --- |
| `PORT` | `4000` |
| `APP_ORIGIN` | `http://localhost:3000` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/it_support_tracker` |
| `JWT_SECRET` | Long random secret set only on the backend |
| `SEED_USER_EMAIL`, `SEED_USER_PASSWORD` | Local inputs to the demo account script |

[NestJS authentication](https://docs.nestjs.com/security/authentication) · [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) · [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) · [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
