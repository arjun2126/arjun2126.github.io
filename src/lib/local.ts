/**
 * The Content Studio is a local authoring tool. It must never be reachable as
 * part of the published website, so both the route and the dock item are gated
 * on a loopback host, including during development.
 */
export function isLocalEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host === '::1'
  );
}
