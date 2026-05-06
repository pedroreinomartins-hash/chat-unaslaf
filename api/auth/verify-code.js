// api/auth/verify-code.js
// Passo 2 do login: verifica código OTP e retorna dados da sessão

import { verifyCode } from '../lib/store.js';
import { findByCPF } from '../lib/sheets.js';

// Token simples de sessão: base64(cpf + ts + secret)
// Para produção com segurança elevada, usar JWT com biblioteca dedicada.
function generateSessionToken(cpf) {
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
    // Sessão válida por 8 horas
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null;
    return cpf;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { cpf, code } = req.body;
    if (!cpf || !code) {
      return res.status(400).json({ error: 'CPF e código são obrigatórios' });
    }
    
    const cpfClean = cpf.replace(/\D/g, '');
    
    const valid = verifyCode(cpfClean, String(code).trim());
    if (!valid) {
      return res.status(401).json({
        error: 'Código inválido ou expirado',
        message: 'O código informado está incorreto ou expirou. Solicite um novo código.',
      });
    }
    
    // Busca dados completos do associado
    const associado = await findByCPF(cpfClean);
    if (!associado) {
      return res.status(404).json({ error: 'Associado não encontrado' });
    }
    
    const sessionToken = generateSessionToken(cpfClean);
    
    return res.status(200).json({
      ok: true,
      token: sessionToken,
      associado: {
        nome: associado.nome,
        cpf: associado.cpf,
        siape: associado.siape,
        email: associado.email,
        telefone: associado.telefone,
        cargo: associado.cargo,
        tipo: associado.tipo,
        situacao: associado.situacao,
        orgao: associado.orgao,
        cidade: associado.cidade,
        uf: associado.uf,
        rowIndex: associado.rowIndex,
      },
    });
    
  } catch (err) {
    console.error('[verify-code]', err);
    return res.status(500).json({ error: 'Erro interno', detail: err.message });
  }
}
