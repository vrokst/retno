import { getSessionId } from "./session";

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("x-session-id", getSessionId());
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(path, { ...options, headers, credentials: "include" });
}
