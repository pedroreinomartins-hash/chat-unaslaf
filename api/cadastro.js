// api/cadastro.js

import { google } from 'googleapis';

const SHEET_ID = '1M9H-RikQ-2ATA7MX8maOydbmzx7a1x2pu0sz6r9OJ4M';
const MAIN_TAB = 'consolidado_app';

function validateSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [cpf, ts, secret] = decoded.split('|');
    const envSecret = process.env.SESSION_SECRET || 'unaslaf-2026';
    if (secret !== envSecret) return null;
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null;
    return cpf;
  } catch { return null; }
}

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT nao configurado');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Mapeamento coluna → índice (0-based)
// K[10]=Email | M[12]=Telefone1 | P[15]=Logradouro | Q[16]=Número
// R[17]=Complemento | S[18]=Bairro | T[19]=Cidade | U[20]=CEP | V[21]=UF
const EDITABLE = {
  nome:        { col: 'B',  idx: 1  },
  email:       { col: 'K',  idx: 10 },
  telefone:    { col: 'M',  idx: 12 },
  logradouro:  { col: 'P',  idx: 15 },
  numero:      { col: 'Q',  idx: 16 },
  complemento: { col: 'R',  idx: 17 },
  bairro:      { col: 'S',  idx: 18 },
  cidade:      { col: 'T',  idx: 19 },
  cep:         { col: 'U',  idx: 20 },
  uf:          { col: 'V',  idx: 21 },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const cpf = validateSessionToken(auth);
  if (!cpf) return res.status(401).json({ error: 'Sessao invalida ou expirada' });

  const sheets = getSheetsClient();

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      // Busca linha pelo CPF
      const search = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${MAIN_TAB}!A:C`,
      });
      const rows = search.data.values || [];
      let rowIndex = null;
      for (let i = 1; i < rows.length; i++) {
        if ((rows[i][2] || '').replace(/\D/g, '') === cpf) { rowIndex = i + 1; break; }
      }
      if (!rowIndex) return res.status(404).json({ error: 'Associado nao encontrado' });

      const line = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${MAIN_TAB}!A${rowIndex}:BL${rowIndex}`,
      });
      const row = (line.data.values || [[]])[0] || [];

      return res.status(200).json({
        ok: true,
        associado: {
          siape:       (row[0]  || '').trim(),
          nome:        (row[1]  || '').trim(),
          cpf:         (row[2]  || '').trim(),
          email:       (row[10] || '').trim(),
          telefone:    (row[12] || '').trim(),
          logradouro:  (row[15] || '').trim(),
          numero:      (row[16] || '').trim(),
          complemento: (row[17] || '').trim(),
          bairro:      (row[18] || '').trim(),
          cidade:      (row[19] || '').trim(),
          cep:         (row[20] || '').trim(),
          uf:          (row[21] || '').trim(),
          situacao:    (row[22] || '').trim(),
          tipo:        row[23] === 'Sim' ? 'Ativo' : (row[24] === 'Sim' ? 'Aposentado' : ''),
          orgao:       (row[33] || '').trim(),
          cargo:       (row[44] || '').trim(),
          rowIndex,
        },
      });
    } catch (err) {
      console.error('[cadastro GET]', err.message);
      return res.status(500).json({ error: 'Erro ao buscar dados', detail: err.message });
    }
  }

  // ── PATCH ─────────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    try {
      const body = req.body || {};

      if (!body.nome || !body.email || !body.telefone) {
        return res.status(400).json({ error: 'Nome, e-mail e telefone sao obrigatorios' });
      }

      // Busca rowIndex
      const search = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${MAIN_TAB}!A:C`,
      });
      const rows = search.data.values || [];
      let rowIndex = null;
      for (let i = 1; i < rows.length; i++) {
        if ((rows[i][2] || '').replace(/\D/g, '') === cpf) { rowIndex = i + 1; break; }
      }
      if (!rowIndex) return res.status(404).json({ error: 'Associado nao encontrado' });

      // Atualiza célula por célula — só os campos que vieram no body
      const updates = [];
      for (const [field, { col, idx }] of Object.entries(EDITABLE)) {
        const val = (body[field] || '').trim();
        if (val) {
          updates.push({
            range: `${MAIN_TAB}!${col}${rowIndex}`,
            values: [[val]],
          });
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates,
        },
      });

      return res.status(200).json({ ok: true, message: 'Cadastro atualizado com sucesso' });

    } catch (err) {
      console.error('[cadastro PATCH]', err.message);
      return res.status(500).json({ error: 'Erro ao atualizar dados', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' });
}
