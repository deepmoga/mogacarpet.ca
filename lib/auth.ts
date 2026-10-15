import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'moga-carpet-flooring-secret-token-key-2026';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function generateToken(payload: object, expiresInMinutes = 60 * 24 * 7): string {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + expiresInMinutes * 60 * 1000,
  });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(dataB64)
    .digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifyToken<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [dataB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(dataB64)
      .digest('base64url');
    if (signature !== expectedSig) return null;

    const parsed = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}
