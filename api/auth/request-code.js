// api/auth/request-code.js

import { google } from 'googleapis';
import { generateSessionToken } from '../lib/token.js';

const SHEET_ID = '1M9H-RikQ-2ATA7MX8maOydbmzx7a1x2pu0sz6r9OJ4M';
const MAIN_TAB = 'consolidado_app';

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT não configurado');
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { cpf } = req.body || {};
    const cpfClean = (cpf || '').replace(/\D/g, '');

    if (!cpfClean || cpfClean.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    const sheets = getSheetsClient();

    // Busca CPF nas colunas A:C
    const searchResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MAIN_TAB}!A:C`,
    });

    const allRows = searchResult.data.values || [];
    let rowIndex = null;

    for (let i = 1; i < allRows.length; i++) {
      const rowCPF = (allRows[i][2] || '').replace(/\D/g, '');
      if (rowCPF === cpfClean) {
        rowIndex = i + 1;
        break;
      }
    }

    if (!rowIndex) {
      return res.status(404).json({
        error: 'CPF não encontrado',
        message: 'Este CPF não está cadastrado na base de associados da UNASLAF. Entre em contato pelo site unaslaf.org.br.',
      });
    }

    // Busca dados completos da linha
    const lineResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MAIN_TAB}!A${rowIndex}:BL${rowIndex}`,
    });
    const row = (lineResult.data.values || [[]])[0] || [];

    const token = generateSessionToken(cpfClean);

    return res.status(200).json({
      ok: true,
      token,
      associado: {
        nome:     (row[1]  || '').trim(),
        cpf:      (row[2]  || '').trim(),
        siape:    (row[0]  || '').trim(),
        email:    (row[10] || '').trim(),
        telefone: (row[12] || '').trim(),
        cidade:   (row[19] || '').trim(),
        uf:       (row[21] || '').trim(),
        situacao: (row[22] || '').trim(),
        tipo:     row[23] === 'Sim' ? 'Ativo' : (row[24] === 'Sim' ? 'Aposentado' : ''),
        orgao:    (row[33] || '').trim(),
        cargo:    (row[44] || '').trim(),
        rowIndex,
      },
    });

  } catch (err) {
    console.error('[request-code]', err.message);
    return res.status(500).json({ error: 'Erro interno', detail: err.message });
  }
}
