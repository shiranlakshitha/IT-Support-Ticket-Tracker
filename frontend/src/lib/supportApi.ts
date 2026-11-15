export type AuthUser = {
  id: string;
  email: string;
};

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type TicketList = {
  items: Ticket[];
  page: number;
  pageSize: number;
  total: number;
};

export type TicketQuery = {
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
};

const DEMO_SESSION_KEY = "support-desk-demo-session";
const DEMO_CREATED_TICKETS_KEY = "support-desk-demo-tickets";
const DEMO_UPDATED_TICKETS_KEY = "support-desk-demo-ticket-updates";
const DEMO_USER: AuthUser = { id: "demo-admin", email: "admin" };
const DEMO_TICKETS: Ticket[] = [
  {
    id: "6741a001d4f239a100000001",
    title: "Office printer is showing as offline",
    description: "The printer on the second floor is unavailable from every workstation.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdAt: "2026-11-15T08:45:00.000Z",
    updatedAt: "2026-11-15T09:30:00.000Z",
  },
  {
    id: "6741a001d4f239a100000002",
    title: "Unable to connect to the company VPN",
    description: "The VPN client stops while verifying my credentials from home.",
    priority: "HIGH",
    status: "OPEN",
    createdAt: "2026-11-14T13:20:00.000Z",
    updatedAt: "2026-11-14T13:20:00.000Z",
  },
  {
    id: "6741a001d4f239a100000003",
    title: "Request access to the finance shared drive",
    description: "I need read access to the monthly reporting folder for my new role.",
    priority: "MEDIUM",
    status: "OPEN",
    createdAt: "2026-11-13T10:15:00.000Z",
    updatedAt: "2026-11-13T10:15:00.000Z",
  },
  {
    id: "6741a001d4f239a100000004",
    title: "External monitor flickers intermittently",
    description: "The monitor connected through my dock flickers several times an hour.",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdAt: "2026-11-10T07:35:00.000Z",
    updatedAt: "2026-11-12T11:05:00.000Z",
  },
  {
    id: "6741a001d4f239a100000005",
    title: "Install approved PDF editing software",
    description: "Please install the approved PDF editor on my replacement laptop.",
    priority: "LOW",
    status: "RESOLVED",
    createdAt: "2026-11-08T14:10:00.000Z",
    updatedAt: "2026-11-09T09:25:00.000Z",
  },
];

function hasDemoSession() {
  return typeof window !== "undefined" && localStorage.getItem(DEMO_SESSION_KEY) === "active";
}

function getDemoCreatedTickets(): Ticket[] {
  if (typeof window === "undefined") return [];

  try {
    const storedTickets = localStorage.getItem(DEMO_CREATED_TICKETS_KEY);
    return storedTickets ? (JSON.parse(storedTickets) as Ticket[]) : [];
  } catch {
    return [];
  }
}

function getDemoTicketUpdates(): Record<string, Ticket> {
  if (typeof window === "undefined") return {};

  try {
    const storedTickets = localStorage.getItem(DEMO_UPDATED_TICKETS_KEY);
    return storedTickets
      ? (JSON.parse(storedTickets) as Record<string, Ticket>)
      : {};
  } catch {
    return {};
  }
}

function getAllDemoTickets(): Ticket[] {
  const updates = getDemoTicketUpdates();
  return [...getDemoCreatedTickets(), ...DEMO_TICKETS].map(
    (ticket) => updates[ticket.id] ?? ticket,
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ErrorBody = {
  message?: string | string[];
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody;
    return Array.isArray(body.message)
      ? body.message.join(" ")
      : body.message || "The request could not be completed.";
  } catch {
    return "The request could not be completed.";
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  if (email.toLowerCase() === "admin" && password === "123") {
    localStorage.setItem(DEMO_SESSION_KEY, "active");
    return DEMO_USER;
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  return (await response.json()) as AuthUser;
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  if (hasDemoSession()) {
    return DEMO_USER;
  }

  const response = await fetch("/api/auth/me", {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  return (await response.json()) as AuthUser;
}

export async function logout(): Promise<void> {
  if (hasDemoSession()) {
    localStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }

  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }
}

export async function getTickets(
  query: TicketQuery,
  signal?: AbortSignal,
): Promise<TicketList> {
  if (hasDemoSession()) {
    const page = query.page ?? 1;
    const pageSize = 20;
    const filteredTickets = getAllDemoTickets().filter(
      (ticket) =>
        (!query.status || ticket.status === query.status) &&
        (!query.priority || ticket.priority === query.priority),
    );

    return {
      items: filteredTickets.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: filteredTickets.length,
    };
  }

  const search = new URLSearchParams();

  if (query.status) search.set("status", query.status);
  if (query.priority) search.set("priority", query.priority);
  if (query.page && query.page > 1) search.set("page", String(query.page));

  const queryString = search.toString();
  const response = await fetch(`/api/tickets${queryString ? `?${queryString}` : ""}`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  return (await response.json()) as TicketList;
}

export async function getTicket(
  id: string,
  signal?: AbortSignal,
): Promise<Ticket> {
  if (hasDemoSession()) {
    const ticket = getAllDemoTickets().find((item) => item.id === id);
    if (!ticket) throw new ApiError("Ticket not found.", 404);
    return ticket;
  }

  const response = await fetch(`/api/tickets/${id}`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  return (await response.json()) as Ticket;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  if (hasDemoSession()) {
    const ticket = getAllDemoTickets().find((item) => item.id === id);
    if (!ticket) throw new ApiError("Ticket not found.", 404);
    if (ticket.status === status) return ticket;

    const nextStatus: Partial<Record<TicketStatus, TicketStatus>> = {
      OPEN: "IN_PROGRESS",
      IN_PROGRESS: "RESOLVED",
    };

    if (nextStatus[ticket.status] !== status) {
      throw new ApiError("Ticket status must follow the support workflow.", 409);
    }

    const updatedTicket = {
      ...ticket,
      status,
      updatedAt: new Date().toISOString(),
    };
    const updates = getDemoTicketUpdates();
    updates[id] = updatedTicket;
    localStorage.setItem(DEMO_UPDATED_TICKETS_KEY, JSON.stringify(updates));
    return updatedTicket;
  }

  const response = await fetch(`/api/tickets/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  return (await response.json()) as Ticket;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  if (hasDemoSession()) {
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: `${Date.now().toString(16)}${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      priority: input.priority,
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    };
    const tickets = [ticket, ...getDemoCreatedTickets()];
    localStorage.setItem(DEMO_CREATED_TICKETS_KEY, JSON.stringify(tickets));
    return ticket;
  }

  const response = await fetch("/api/tickets", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  return (await response.json()) as Ticket;
}
