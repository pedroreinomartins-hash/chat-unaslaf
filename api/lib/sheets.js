// api/lib/sheets.js
// Utilitário para leitura e escrita na planilha de associados via Google Sheets API

import { google } from 'googleapis';

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

const SHEET_ID = process.env.SHEETS_ID || '1M9H-RikQ-2ATA7MX8maOydbmzx7a1x2pu0sz6r9OJ4M';
const MAIN_TAB = 'consolidado_app';
const HIST_TAB = 'Histórico';

/**
 * Colunas da planilha consolidado_app (índice 0-based):
 * A(0):SIAPE | B(1):Nome | C(2):CPF | D(3):Data Nascimento | E(4):Sexo
 * F(5):Escolaridade | G(6):Valor Mensalidade | H(7):Situação Cadastro
 * I(8):Comando | J(9):Modo Pagamento | K(10):Email Principal
 * L(11):Emails Adicionais | M(12):Telefone 1 | N(13):Telefone 2 | O(14):Telefone 3
 * P(15):Logradouro | Q(16):Número | R(17):Complemento | S(18):Bairro
 * T(19):Cidade | U(20):CEP | V(21):UF | W(22):Situação Funcional
 * X(23):Ativo | Y(24):Aposentado | ... | AH(33):Órgão | ...
 * AN(39):Carreira | AO(40):Categoria Funcional | ...
 */

/**
 * Busca associado pelo CPF (apenas dígitos)
 */
export async function findByCPF(cpf) {
  const sheets = getSheetsClient();
  const cpfClean = cpf.replace(/\D/g, '');

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A:AQ`,
  });

  const rows = res.data.values || [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowCPF = (row[2] || '').replace(/\D/g, '');
    if (rowCPF === cpfClean) {
      return {
        rowIndex: i + 1,
        siape:     row[0]  || '',
        nome:      row[1]  || '',
        cpf:       row[2]  || '',
        email:     row[10] || '',
        telefone:  row[12] || '',
        endereco:  [row[15], row[16], row[17]].filter(Boolean).join(', '),
        cidade:    row[19] || '',
        uf:        row[21] || '',
        situacao:  row[22] || '',   // Situação Funcional
        tipo:      row[23] === 'Sim' ? 'Ativo' : (row[24] === 'Sim' ? 'Aposentado' : ''),
        orgao:     row[33] || '',
        cargo:     row[40] || '',
        situacaoCadastro: row[7] || '',
      };
    }
  }

  return null;
}

/**
 * Atualiza dados editáveis do associado (merge inteligente — campo vazio não sobrescreve)
 */
export async function updateAssociado(rowIndex, updates, alteradoPor = 'usuário') {
  const sheets = getSheetsClient();

  // Lê linha atual
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A${rowIndex}:AQ${rowIndex}`,
  });
  const current = (res.data.values || [[]])[0] || [];
  while (current.length < 43) current.push('');

  // Aplica somente os campos não-vazios
  if (updates.nome     && updates.nome.trim())     current[1]  = updates.nome.trim();
  if (updates.email    && updates.email.trim())    current[10] = updates.email.trim();
  if (updates.telefone && updates.telefone.trim()) current[12] = updates.telefone.trim();
  if (updates.cidade   && updates.cidade.trim())   current[19] = updates.cidade.trim();
  if (updates.uf       && updates.uf.trim())       current[21] = updates.uf.trim();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A${rowIndex}:AQ${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [current] },
  });

  await appendHistory(rowIndex, updates, alteradoPor);
}

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
      requestBody: { values: [[ts, rowIndex, alteradoPor, fields, 'atualização cadastro']] },
    });
  } catch {
    // Aba histórico pode não existir ainda
  }
}
