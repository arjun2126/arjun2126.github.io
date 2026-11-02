import type { IncomingMessage } from 'node:http';
import { isIP } from 'node:net';

function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) return false;
  if (address === '::1') return true;
  const ipv4 = address.startsWith('::ffff:') ? address.slice(7) : address;
  return isIP(ipv4) === 4 && ipv4.startsWith('127.');
}

/** Validate the actual peer, not spoofable Forwarded/X-Forwarded-* headers. */
export function allowsLocalStudioRequest(req: IncomingMessage, requireOrigin: boolean): boolean {
  if (!isLoopbackAddress(req.socket.remoteAddress)) return false;
  const host = req.headers.host;
  if (!host) return false;

  try {
    const target = new URL(`http://${host}`);
    if (
      target.host !== host.toLowerCase() ||
      !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
      Number(target.port || 80) !== req.socket.localPort
    ) return false;

    const origin = req.headers.origin;
    if (!origin) return !requireOrigin;
    // Serialized, same-origin HTTP origin only: rejects null, userinfo, paths,
    // lookalike localhost names, other ports, and cross-site browser requests.
    const parsed = new URL(origin);
    return origin === parsed.origin && parsed.origin === target.origin;
  } catch {
    return false;
  }
}
