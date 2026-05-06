// api/lib/token.js
// Geração e validação de tokens de sessão

export function generateSessionToken(cpf) {
  const secret = process.env.SESSION_SECRET || 'unaslaf-2026';
  const payload = `${cpf}|${Date.now()}|${secret}`;
  return Buffer.from(payload).toString('base64url');
}

export function validateSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [cpf, ts, secret] = decoded.split('|');
    const envSecret = process.env.SESSION_SECRET || 'unaslaf-2026';
    if (secret !== envSecret) return null;
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null; // 8h
    return cpf;
  } catch {
    return null;
  }
}
