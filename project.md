# IT Support Ticket Tracker

Build a small help desk app for logging IT issues and tracking them from **Open** to **In Progress** to **Resolved**. A signed-in user can create, view, filter, and update the status of their own tickets. For the first version, use one account type and create demo accounts with a seed script.

## Stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | Next.js App Router, TypeScript, Radix UI Primitives, Tailwind CSS | Login, ticket list, new-ticket form, and ticket details |
| Client state | Zustand | Shared ticket filters and pagination |
| API requests | Browser `fetch` | Login, ticket queries, and ticket updates |
| Backend | NestJS, TypeScript, JWT authentication | Login, validation, ticket ownership, and status changes |
| Database | MongoDB, Mongoose | Users and tickets |

The browser calls `/api` on the Next.js origin. A rewrite forwards the request to NestJS, which handles authentication and reads or writes records in MongoDB. The browser sends the JWT in an HttpOnly cookie.

## Build order

1. **Set up the repository.** Put the Next.js app in `frontend/` and the NestJS app in `backend/`. Run Next.js on port 3000 and NestJS on port 4000. Connect NestJS to a local MongoDB instance or MongoDB Atlas.
2. **Define the data and seed a user.** Implement the two Mongoose schemas, initialize the indexes, and add a repeatable seed script. See [database.md](database.md).
3. **Build login.** Add login, current-user, and logout routes. Verify the cookie flow through the Next.js rewrite. See [backend.md](backend.md).
4. **Build the ticket API.** Implement create, list, details, and status update. Verify owner-scoped filtering and the three-step status workflow before connecting the UI.
5. **Connect the four screens.** Build the forms and filters with Radix UI controls where needed. Use Zustand for shared filter and page state, and connect the screens to the API with `fetch`. See [frontend.md](frontend.md).
6. **Prepare the demo.** Run the checks below, then capture screenshots of the list and ticket details for the repository README.

## Demo checklist

- [ ] Sign in with a seeded user and see the ticket list. A wrong password shows an error.
- [ ] Create a Medium-priority ticket for an offline printer. It appears as Open and persists after refresh.
- [ ] Filter the list by status and priority, then clear the filters. With more than 20 tickets, verify pagination and page reset on filter changes.
- [ ] Start progress, then resolve the ticket. The list and details show the new status. On a fresh Open ticket, attempt to set Resolved through the API and verify that it returns `409` and leaves the ticket Open.
- [ ] Sign in as a second user. The first user's tickets are absent from the list, and direct requests to view or update one return `404`.
- [ ] Sign out and verify that protected routes ask for login. Check the same behavior with an expired JWT.

## CV entry once implemented

**IT Support Ticket Tracker** — Next.js, Radix UI, Zustand, NestJS, MongoDB  
Built a full-stack help desk application with JWT login, per-user ticket access, priority and status filters, and a validated ticket resolution workflow.
