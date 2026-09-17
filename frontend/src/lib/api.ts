const BASE_URL = import.meta.env.VITE_API_URL ?? "/api"

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const body = res.headers.get("content-type")?.includes("application/json")
    ? await res.json()
    : await res.text()

  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, body)
  }

  return body as T
}
