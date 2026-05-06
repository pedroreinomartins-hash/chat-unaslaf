// api/auth/request-code.js
// Versão com logs de diagnóstico

import { google } from 'googleapis';

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

    console.log('[request-code] CPF recebido:', cpf, '→ limpo:', cpfClean);

    if (!cpfClean || cpfClean.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido', cpfRecebido: cpf, cpfLimpo: cpfClean });
    }

    // Lê planilha diretamente (sem importar lib para isolar o problema)
    const sheets = getSheetsClient();

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MAIN_TAB}!A1:C10`,  // só primeiras 10 linhas, colunas A-C
    });

    const rows = result.data.values || [];
    console.log('[request-code] Total linhas retornadas (A:C, primeiras 10):', rows.length);
    console.log('[request-code] Linha 0 (cabeçalho):', JSON.stringify(rows[0]));
    console.log('[request-code] Linha 1:', JSON.stringify(rows[1]));
    console.log('[request-code] Linha 2:', JSON.stringify(rows[2]));

    // Agora busca em toda a planilha
    const fullResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MAIN_TAB}!A:C`,  // só colunas A, B, C (SIAPE, Nome, CPF)
    });

    const allRows = fullResult.data.values || [];
    console.log('[request-code] Total linhas na planilha completa:', allRows.length);

    // Busca o CPF
    let found = null;
    for (let i = 1; i < allRows.length; i++) {
      const row = allRows[i];
      const rowCPF = (row[2] || '').replace(/\D/g, '');
      if (rowCPF === cpfClean) {
        found = { rowIndex: i + 1, siape: row[0], nome: row[1], cpf: row[2] };
        break;
      }
    }

    console.log('[request-code] Resultado busca:', found ? 'ENCONTRADO' : 'NÃO ENCONTRADO');

    if (!found) {
      // Mostra primeiros 5 CPFs da planilha para diagnóstico
      const sample = allRows.slice(1, 6).map(r => ({
        raw: r[2],
        limpo: (r[2] || '').replace(/\D/g, ''),
      }));
      console.log('[request-code] Amostra de CPFs na planilha:', JSON.stringify(sample));

      return res.status(404).json({
        error: 'CPF não encontrado',
        message: 'Este CPF não está cadastrado na base de associados da UNASLAF.',
        debug: {
          cpfBuscado: cpfClean,
          totalLinhas: allRows.length,
          amostraCPFs: sample,
        },
      });
    }

    // Busca dados completos da linha encontrada
    const lineResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MAIN_TAB}!A${found.rowIndex}:BL${found.rowIndex}`,
    });
    const row = (lineResult.data.values || [[]])[0] || [];

    const { generateSessionToken } = await import('./verify-code.js');
    const token = generateSessionToken(cpfClean);

    return res.status(200).json({
      ok: true,
      token,
      associado: {
        nome:      (row[1]  || '').trim(),
        cpf:       (row[2]  || '').trim(),
        siape:     (row[0]  || '').trim(),
        email:     (row[10] || '').trim(),
        telefone:  (row[12] || '').trim(),
        cidade:    (row[19] || '').trim(),
        uf:        (row[21] || '').trim(),
        situacao:  (row[22] || '').trim(),
        tipo:      row[23] === 'Sim' ? 'Ativo' : (row[24] === 'Sim' ? 'Aposentado' : ''),
        orgao:     (row[33] || '').trim(),
        cargo:     (row[44] || '').trim(),
        rowIndex:  found.rowIndex,
      },
    });

  } catch (err) {
    console.error('[request-code] ERRO:', err.message, err.stack);
    return res.status(500).json({
      error: 'Erro interno',
      detail: err.message,
      stack: err.stack,
    });
  }
}
