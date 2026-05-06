// api/lib/sheets.js
// Utilitário para leitura e escrita na planilha de associados via Google Sheets API

import { google } from 'googleapis';

/**
 * Retorna um cliente autenticado do Google Sheets
 */
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

const SHEET_ID = process.env.SHEETS_ID;
const MAIN_TAB = 'Sheet1';
const HIST_TAB = 'Histórico';

/**
 * Colunas da planilha (índice 0-based):
 * A(0):Origem | B(1):SIAPE | C(2):Nome | D(3):CPF | E(4):Email
 * F(5):Telefone | G(6):Observações | H(7):Cargo | I(8):Servidor/Pensionista
 * J(9):Situação funcional | K(10):Órgão | L(11):Endereço | M(12):Cidade
 * N(13):UF | O(14):Data Atualização | P(15):Alterado por
 */

/**
 * Busca um associado pelo CPF (somente dígitos)
 * @returns {object|null} dados do associado ou null
 */
export async function findByCPF(cpf) {
  const sheets = getSheetsClient();
  const cpfClean = cpf.replace(/\D/g, '');
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A:P`,
  });
  
  const rows = res.data.values || [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowCPF = (row[3] || '').replace(/\D/g, '');
    if (rowCPF === cpfClean) {
      return {
        rowIndex: i + 1, // 1-based para Sheets API
        origem: row[0] || '',
        siape: row[1] || '',
        nome: row[2] || '',
        cpf: row[3] || '',
        email: row[4] || '',
        telefone: row[5] || '',
        observacoes: row[6] || '',
        cargo: row[7] || '',
        tipo: row[8] || '',       // Servidor/Pensionista
        situacao: row[9] || '',   // Situação funcional
        orgao: row[10] || '',
        endereco: row[11] || '',
        cidade: row[12] || '',
        uf: row[13] || '',
        dataAtualizacao: row[14] || '',
        alteradoPor: row[15] || '',
      };
    }
  }
  
  return null;
}

/**
 * Atualiza dados do associado na linha existente (merge inteligente)
 * Campos vazios NÃO sobrescrevem dados existentes
 */
export async function updateAssociado(rowIndex, updates, alteradoPor = 'usuário') {
  const sheets = getSheetsClient();
  
  // Lê linha atual
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A${rowIndex}:P${rowIndex}`,
  });
  const current = (res.data.values || [[]])[0] || [];
  
  // Mapa de campos para índice de coluna
  const fieldMap = {
    nome: 2,
    email: 4,
    telefone: 5,
    observacoes: 6,
    cargo: 7,
    tipo: 8,
    situacao: 9,
    orgao: 10,
    endereco: 11,
    cidade: 12,
    uf: 13,
  };
  
  // Merge: só aplica se o novo valor não for vazio
  const newRow = [...current];
  while (newRow.length < 16) newRow.push('');
  
  for (const [field, colIdx] of Object.entries(fieldMap)) {
    if (updates[field] !== undefined && updates[field] !== '') {
      newRow[colIdx] = updates[field];
    }
  }
  
  // Atualiza data e responsável
  newRow[14] = new Date().toISOString();
  newRow[15] = alteradoPor;
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A${rowIndex}:P${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [newRow] },
  });
  
  // Registra no histórico
  await appendHistory(rowIndex, updates, alteradoPor);
}

/**
 * Registra alteração na aba Histórico
 */
async function appendHistory(rowIndex, updates, alteradoPor) {
  const sheets = getSheetsClient();
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const fields = Object.entries(updates)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${HIST_TAB}!A:E`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[ts, rowIndex, alteradoPor, fields, 'atualização cadastro']],
      },
    });
  } catch {
    // Aba histórico pode não existir ainda — ignora silenciosamente
  }
}
