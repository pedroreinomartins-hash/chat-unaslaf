// api/auth/request-code.js
// Versão simplificada: valida CPF na planilha e retorna sessão direto.
// TODO: reativar envio de OTP via WhatsApp quando Z-API estiver disponível.

import { findByCPF } from '../lib/sheets.js';
import { generateSessionToken } from './verify-code.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { cpf } = req.body;
    if (!cpf) return res.status(400).json({ error: 'CPF obrigatório' });

    const cpfClean = cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    const associado = await findByCPF(cpfClean);

    if (!associado) {
      return res.status(404).json({
        error: 'CPF não encontrado',
        message: 'Este CPF não está cadastrado na base de associados da UNASLAF. Entre em contato pelo site unaslaf.org.br para solicitar seu cadastro.',
      });
    }

    const token = generateSessionToken(cpfClean);

    return res.status(200).json({
      ok: true,
      token,
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
    console.error('[request-code]', err);
    return res.status(500).json({ error: 'Erro interno', detail: err.message });
  }
}
