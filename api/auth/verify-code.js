// api/auth/verify-code.js
export function validateSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [cpf, ts, secret] = decoded.split('|');
    const envSecret = process.env.SESSION_SECRET || 'unaslaf-2026';
    if (secret !== envSecret) return null;
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null;
    return cpf;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.status(404).json({ error: 'Endpoint nao utilizado' });
}
