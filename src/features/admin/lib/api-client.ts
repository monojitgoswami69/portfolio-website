/**
 * Wrapper around fetch for admin-authenticated calls.
 *
 * Adds:
 * - `credentials: 'include'` so the JWT cookie is sent
 * - `X-Requested-With: XMLHttpRequest` so the middleware's CSRF check passes
 *
 * Use this for ANY request to `/api/v1/*` (besides public POST to `/api/v1/communication`).
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Requested-With", "XMLHttpRequest");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
