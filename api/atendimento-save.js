// api/atendimento-save.js
// =============================================================================
// Salva o histórico de atendimento na planilha logs_atendimento (Google Sheets)
// =============================================================================
// PLANILHA: logs_atendimento
// ID: 1PcYBys8w1MJk5PWrOkRfz4Af2WLTjM3igP0UFARjdCA
// ABA: Sheet1 (criada automaticamente pelo Google Sheets)
//
// ESTRUTURA DAS COLUNAS (uma linha por atendimento):
//   A: Data/Hora    B: CPF    C: Nome    D: Duração (min)
//   E: Nº Mensagens    F: Histórico completo
//
// CABEÇALHO: inserido automaticamente na primeira vez que o endpoint é chamado
// =============================================================================

import { google } from 'googleapis';

const LOGS_SHEET_ID = process.env.LOGS_SHEET_ID || '1PcYBys8w1MJk5PWrOkRfz4Af2WLTjM3igP0UFARjdCA';
const LOGS_TAB      = 'Sheet1';

function validateSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [cpf, ts, secret] = decoded.split('|');
    const envSecret = process.env.SESSION_SECRET || 'unaslaf-2026';
    if (secret !== envSecret) return null;
    if (Date.now() - Number(ts) > 8 * 60 * 60 * 1000) return null;
    return { cpf, ts: Number(ts) };
  } catch { return null; }
}

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

function fmtDataHora() {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Monta o histórico da conversa em texto compacto para caber numa célula
function montarHistorico(history) {
  return (history || [])
    .filter(m => m.role && m.content)
    .map(m => {
      const role = m.role === 'user' ? 'Você' : 'UNA+';
      // Remove HTML tags da resposta da IA
      const texto = (m.content || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .trim();
      return `[${role}] ${texto}`;
    })
    .join(' | ');
}

// Verifica se a aba já tem cabeçalho — insere se estiver vazia
async function garantirCabecalho(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: LOGS_SHEET_ID,
    range: `${LOGS_TAB}!A1:F1`,
  });
  const primeira = (res.data.values || [])[0] || [];
  if (!primeira.length || primeira[0] !== 'Data/Hora') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: LOGS_SHEET_ID,
      range: `${LOGS_TAB}!A1:F1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Data/Hora', 'CPF', 'Nome', 'Duração (min)', 'Nº Mensagens', 'Histórico']],
      },
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const session = validateSessionToken(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida ou expirada' });

  try {
    const { history, nomeAssociado, inicioTs } = req.body || {};

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Histórico vazio — nada a salvar' });
    }

    const msgs = history.filter(m => m.role && m.content);
    const duracaoMin = inicioTs ? Math.round((Date.now() - inicioTs) / 60000) : 0;
    const historico  = montarHistorico(msgs);
    const dataHora   = fmtDataHora();

    const sheets = getSheetsClient();

    // Garante cabeçalho na primeira linha
    await garantirCabecalho(sheets);

    // Append da nova linha de log
    await sheets.spreadsheets.values.append({
      spreadsheetId: LOGS_SHEET_ID,
      range: `${LOGS_TAB}!A:F`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          dataHora,
          session.cpf,
          nomeAssociado || '',
          duracaoMin,
          msgs.length,
          historico,
        ]],
      },
    });

    // Identificador amigável para exibir no modal de sucesso
    const arquivo = `Log ${dataHora} — ${nomeAssociado || session.cpf}`;

    console.log(`[atendimento-save] Salvo: ${arquivo}`);

    return res.status(200).json({
      ok: true,
      arquivo,
      message: 'Atendimento salvo com sucesso',
    });

  } catch (err) {
    console.error('[atendimento-save]', err.message);
    return res.status(500).json({ error: 'Erro ao salvar atendimento', detail: err.message });
  }
}
