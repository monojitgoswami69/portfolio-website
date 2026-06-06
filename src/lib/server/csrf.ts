/**
 * Returns true when the request appears to originate from our own front-end.
 * Defense-in-depth against CSRF for cookie-authenticated mutating endpoints.
 *
 * Strategy:
 *   1. Compare the Origin or Referer header against the request host.
 *      Browsers always send Origin on cross-site POST/PUT/DELETE with credentials.
 *   2. Require an `X-Requested-With: XMLHttpRequest` header. This header is
 *      not on the CORS-safelist, so cross-site form submissions cannot set it
 *      without a preflight (which we do not respond to with permissive CORS).
 *
 * NOTE: usable from edge middleware — must not depend on Node-only APIs.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // Custom header check — non-safelisted header forces a preflight on cross-origin.
  const xrw = request.headers.get("x-requested-with");
  if (xrw !== "XMLHttpRequest") {
    return false;
  }

  if (!host) return false;

  const expectedOrigin = `https://${host}`;
  const expectedOriginInsecure = `http://${host}`;

  if (origin) {
    return origin === expectedOrigin || origin === expectedOriginInsecure;
  }

  if (referer) {
    try {
      const refUrl = new URL(referer);
      return refUrl.host === host;
    } catch {
      return false;
    }
  }

  return false;
}
