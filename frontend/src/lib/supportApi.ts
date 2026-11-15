export type AuthUser = {
  id: string;
  email: string;
};

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
