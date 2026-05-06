// api/lib/sheets.js

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
 * Mapeamento real de colunas (índice 0-based), planilha consolidado_app:
 * [00] SIAPE            [01] Nome              [02] CPF
 * [03] Data Nascimento  [04] Sexo              [05] Escolaridade
 * [06] Valor Mensalidade[07] Situação Cadastro [08] Comando
 * [09] Modo Pagamento   [10] Email Principal   [11] Emails Adicionais
 * [12] Telefone 1       [13] Telefone 2        [14] Telefone 3
 * [15] Logradouro       [16] Número            [17] Complemento
 * [18] Bairro           [19] Cidade            [20] CEP
 * [21] UF               [22] Situação Funcional[23] Ativo
 * [24] Aposentado       [30] Situação Servidor [33] Órgão
 * [43] Carreira         [44] Categoria Funcional
 */

function cleanCPF(v) {
  return (v || '').replace(/\D/g, '');
}

export async function findByCPF(cpf) {
  const sheets = getSheetsClient();
  const cpfClean = cleanCPF(cpf);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A:BL`,   // BL = coluna 64, cobre toda a planilha
  });

  const rows = res.data.values || [];

  // Linha 0 é o cabeçalho — pula
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    if (cleanCPF(row[2]) === cpfClean) {
      return {
        rowIndex:  i + 1,           // 1-based (Sheets API)
        siape:     (row[0]  || '').trim(),
        nome:      (row[1]  || '').trim(),
        cpf:       (row[2]  || '').trim(),
        email:     (row[10] || '').trim(),
        telefone:  (row[12] || '').trim(),
        logradouro:(row[15] || '').trim(),
        numero:    (row[16] || '').trim(),
        complemento:(row[17]|| '').trim(),
        bairro:    (row[18] || '').trim(),
        cidade:    (row[19] || '').trim(),
        cep:       (row[20] || '').trim(),
        uf:        (row[21] || '').trim(),
        situacao:  (row[22] || '').trim(),   // Situação Funcional
        tipo:      (row[23] === 'Sim') ? 'Ativo' : ((row[24] === 'Sim') ? 'Aposentado' : ''),
        situacaoServidor: (row[30] || '').trim(),
        orgao:     (row[33] || '').trim(),
        carreira:  (row[43] || '').trim(),
        cargo:     (row[44] || '').trim(),   // Categoria Funcional
        situacaoCadastro: (row[7] || '').trim(),
      };
    }
  }

  return null;
}

export async function updateAssociado(rowIndex, updates, alteradoPor = 'usuário') {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A${rowIndex}:BL${rowIndex}`,
  });
  const current = (res.data.values || [[]])[0] || [];
  while (current.length < 64) current.push('');

  if (updates.nome     && updates.nome.trim())     current[1]  = updates.nome.trim();
  if (updates.email    && updates.email.trim())    current[10] = updates.email.trim();
  if (updates.telefone && updates.telefone.trim()) current[12] = updates.telefone.trim();
  if (updates.cidade   && updates.cidade.trim())   current[19] = updates.cidade.trim();
  if (updates.uf       && updates.uf.trim())       current[21] = updates.uf.trim();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${MAIN_TAB}!A${rowIndex}:BL${rowIndex}`,
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
  } catch { /* aba histórico pode não existir */ }
}
