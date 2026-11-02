import type { IncomingMessage } from 'node:http';
import { describe, expect, it } from 'vitest';
import { allowsLocalStudioRequest } from '../../server/local-access';

function request(overrides: {
  peer?: string; host?: string; origin?: string; port?: number;
} = {}): IncomingMessage {
  return {
    socket: { remoteAddress: overrides.peer ?? '127.0.0.1', localPort: overrides.port ?? 5173 },
    headers: { host: overrides.host ?? '127.0.0.1:5173', origin: overrides.origin },
  } as IncomingMessage;
}

describe('Content Studio loopback boundary', () => {
  it.each(['127.0.0.1', '127.0.0.2', '::1', '::ffff:127.0.0.1'])(
    'accepts same-origin writes from loopback peer %s', (peer) => {
      expect(allowsLocalStudioRequest(request({ peer, origin: 'http://127.0.0.1:5173' }), true)).toBe(true);
    },
  );

  it.each(['localhost:5173', '[::1]:5173'])('accepts exact loopback host %s', (host) => {
    expect(allowsLocalStudioRequest(request({ host, origin: `http://${host}` }), true)).toBe(true);
  });

  it.each(['192.168.1.20', '10.0.0.1', '::ffff:192.168.1.20', '2001:db8::1'])(
    'rejects non-loopback peer %s even with trusted-looking headers', (peer) => {
      const req = request({ peer, origin: 'http://127.0.0.1:5173' });
      req.headers['x-forwarded-for'] = '127.0.0.1';
      expect(allowsLocalStudioRequest(req, true)).toBe(false);
    },
  );

  it.each(['evil.test:5173', 'localhost.evil.test:5173', '127.0.0.1:9000',
    'user@localhost:5173', 'localhost:5173/path', 'localhost:5173#fragment', 'localhost:invalid'])(
    'rejects invalid or untrusted Host %s', (host) => {
      expect(allowsLocalStudioRequest(request({ host, origin: `http://${host}` }), true)).toBe(false);
    },
  );

  it.each([undefined, 'null', 'https://127.0.0.1:5173', 'http://127.0.0.1:9000',
    'http://localhost:5173', 'http://evil.test', 'http://127.0.0.1:5173/path',
    'http://user@127.0.0.1:5173', 'http://127.0.0.1:5173/'])(
    'rejects missing, malformed or cross-origin write Origin %s', (origin) => {
      expect(allowsLocalStudioRequest(request({ origin }), true)).toBe(false);
    },
  );

  it('allows originless loopback state reads but rejects cross-origin reads', () => {
    expect(allowsLocalStudioRequest(request(), false)).toBe(true);
    expect(allowsLocalStudioRequest(request({ origin: 'http://evil.test' }), false)).toBe(false);
  });

  it('fails closed without peer or Host', () => {
    const req = request({ origin: 'http://127.0.0.1:5173' });
    delete req.headers.host;
    expect(allowsLocalStudioRequest(req, true)).toBe(false);
    expect(allowsLocalStudioRequest({ headers: {}, socket: {} } as IncomingMessage, false)).toBe(false);
  });
});
