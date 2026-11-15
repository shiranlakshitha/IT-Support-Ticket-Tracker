# IT Support Ticket Tracker — Frontend

Use Next.js App Router with TypeScript, Radix UI Primitives for interactive components, and Tailwind CSS for styling. Use Zustand for shared ticket filters and pagination. Call the NestJS API with `fetch`.

## Pages

| Route | Screen | User actions |
| --- | --- | --- |
| `/login` | Sign in | Enter email and password. Show a generic error for incorrect credentials. |
| `/tickets` | My tickets | View the newest tickets first, filter by status or priority, page through results, and open a ticket. |
| `/tickets/new` | New ticket | Enter a title and description, choose a priority, and submit. |
| `/tickets/[id]` | Ticket details | Read the full description, see the status and dates, and move the ticket to its next status. |

Use `/` to route into `/tickets`. Put the sign-out button in the shared layout for ticket pages. The list can show title, priority, status, and created date. Use text labels inside status and priority badges so color is supplementary.

## Suggested frontend structure

```text
frontend/
  next.config.ts
  src/
    app/
      layout.tsx
      page.tsx
      login/page.tsx
      (workspace)/
        layout.tsx
        tickets/
          page.tsx
          new/page.tsx
          [id]/page.tsx
    components/
      TicketForm.tsx
      TicketTable.tsx
      TicketFilters.tsx
    lib/
      supportApi.ts
    store/
      TicketFiltersProvider.tsx
      ticketFiltersStore.ts
```

## Zustand and API

- Create one Zustand store for `status`, `priority`, and `page`. Initialize it once per mounted client-side `TicketFiltersProvider` in the protected layout. Read it through selectors in client components. Keep the store in memory.
- Set `page` to `1` when a filter changes. Use an explicit **All** option in each filter, then omit that filter from the API request.
- Use one small `supportApi.ts` module for the auth and ticket requests. Return parsed data for JSON responses and handle `204` without parsing a body.
- Keep form values, ticket results, loading states, and request errors local to the components that use them. Fetch the list on page entry and when the filters or page change. Cancel superseded requests so a slow response cannot overwrite newer results.
- Use the ticket returned by a successful status update to refresh the detail view. On a `409`, fetch the ticket again and show its current status.

## Login and request flow

1. Send requests to relative paths under `/api`. In development, configure a Next.js rewrite from `/api/:path*` to `${API_ORIGIN}/api/:path*`, with `API_ORIGIN=http://localhost:4000`.
2. After `POST /api/auth/login` succeeds, route to `/tickets`.
3. In the ticket layout, run `GET /api/auth/me` before showing protected screens. On refresh, the browser sends the cookie and the API restores the visible user state.
4. Treat a `401` on a protected request as an expired or missing session. Clear the authenticated user in the protected layout, unmount the ticket views and filter store, and route to `/login`. Show a retry action for a network error.
5. On a successful `POST /api/auth/logout`, use the same cleanup and return to login. Show a retry action if logout fails. The JWT stays in the browser's HttpOnly cookie until the server clears it or it expires.

## UI behavior

- Use Radix Select for status and priority filters and for the priority picker on the new-ticket form. Give each control a visible label. Use standard HTML inputs, buttons, and tables for the rest of the UI.
- Disable submit and status buttons while their requests are pending. Retain the user's input if a request fails.
- Open the ticket detail page after a successful creation. The default priority is Medium.
- Show a loading state and distinguish an empty list from a request error. A `404` on a detail page should offer a link back to the ticket list.
- In the ticket detail page show **Start progress** for Open and **Resolve ticket** for In Progress. Show the current status on Resolved tickets.
- Use the request, response, and error contract in [backend.md](backend.md).

[Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select) · [Zustand with Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs) · [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
