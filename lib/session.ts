import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'arena_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.ARENA_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('Configure ARENA_SESSION_SECRET with at least 32 characters.');
  return value;
}

export function authConfigured() {
  return Boolean(process.env.ARENA_ADMIN_PASSWORD_HASH && process.env.ARENA_SESSION_SECRET && process.env.ARENA_SESSION_SECRET.length >= 32);
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password: string) {
  const stored = process.env.ARENA_ADMIN_PASSWORD_HASH;
  if (!stored || password.length > 256) return false;
  const [salt, digest] = stored.split(':');
  if (!salt || !/^[a-f0-9]{128}$/i.test(digest || '')) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, 'hex'));
}

export function createSession(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: 'owner', exp: Math.floor(now / 1000) + SESSION_SECONDS, nonce: randomBytes(12).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function validSession(token: string | undefined, now = Date.now()) {
  if (!token || token.length > 1024 || !authConfigured()) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = createHmac('sha256', secret()).update(payload).digest();
  const received = Buffer.from(signature, 'base64url');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.sub === 'owner' && Number.isInteger(data.exp) && data.exp > Math.floor(now / 1000) && data.exp <= Math.floor(now / 1000) + SESSION_SECONDS;
  } catch { return false; }
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    const host = request.headers.get('host') || target.host;
    return source.origin === origin && source.host === host && source.protocol === target.protocol;
  } catch { return false; }
}

