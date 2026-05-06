// api/lib/auth.js

import { validateSessionToken } from './token.js';

export async function requireAuth(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    res.status(401).json({ error: 'Token de sessão obrigatório' });
    return null;
  }
  const cpf = validateSessionToken(token);
  if (!cpf) {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    return null;
  }
  return cpf;
}
