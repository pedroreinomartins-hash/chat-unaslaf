// api/cadastro.js
// GET: retorna dados do associado autenticado
// PATCH: atualiza dados editáveis (merge inteligente)

import { requireAuth } from './lib/auth.js';
import { findByCPF, updateAssociado } from './lib/sheets.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const cpf = await requireAuth(req, res);
  if (!cpf) return;

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const associado = await findByCPF(cpf);
      if (!associado) return res.status(404).json({ error: 'Associado não encontrado' });
      return res.status(200).json({ ok: true, associado });
    } catch (err) {
      console.error('[cadastro GET]', err);
      return res.status(500).json({ error: 'Erro ao buscar dados', detail: err.message });
    }
  }

  // ── PATCH ─────────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    try {
      const { nome, email, telefone, endereco, cidade, uf } = req.body;

      // Validação dos obrigatórios
      if (!nome || !email || !telefone) {
        return res.status(400).json({
          error: 'Nome, e-mail e telefone são obrigatórios',
        });
      }

      const associado = await findByCPF(cpf);
      if (!associado) return res.status(404).json({ error: 'Associado não encontrado' });

      await updateAssociado(
        associado.rowIndex,
        { nome, email, telefone, endereco, cidade, uf },
        'usuário'
      );

      return res.status(200).json({ ok: true, message: 'Cadastro atualizado com sucesso' });
    } catch (err) {
      console.error('[cadastro PATCH]', err);
      return res.status(500).json({ error: 'Erro ao atualizar dados', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
