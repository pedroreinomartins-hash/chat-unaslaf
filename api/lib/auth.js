// api/lib/auth.js
// Middleware de validação de sessão reutilizável em todos os endpoints protegidos

import { validateSessionToken } from '../auth/verify-code.js';
import { findByCPF } from './sheets.js';

/**
 * Valida Authorization header e retorna CPF autenticado
 * Uso: const cpf = await requireAuth(req, res); if (!cpf) return;
 */
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

/**
 * Valida e retorna dados completos do associado autenticado
 */
export async function requireAssociado(req, res) {
  const cpf = await requireAuth(req, res);
  if (!cpf) return null;
  
  const associado = await findByCPF(cpf);
  if (!associado) {
    res.status(404).json({ error: 'Associado não encontrado' });
    return null;
  }
  
  return associado;
}
