// ── Colunas da planilha ROLDEASSOCIADOS_APP_CONSOLIDADO (Sheet1) ──
// A: Origem      (0)
// B: SIAPE       (1)
// C: Nome        (2)
// D: CPF         (3) ← chave de busca
// E: Email       (4)
// F: Telefone    (5)
// G: Observações (6)
// H: Cargo       (7)
// I: Servidor/Pensionista (8)
// J: Situação funcional   (9)
// K: Órgão       (10)
// L: Endereço    (11)
// M: Cidade      (12)
// N: UF          (13)
// O: Data Atualização (14)
// P: Alterado por     (15) ← adicionada pelo sistema

async function getAccessToken(credentials) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now    = Math.floor(Date.now() / 1000);
  const claim  = Buffer.from(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const signingInput = `${header}.${claim}`;
  const pemKey  = credentials.private_key.replace(/\\n/g, '\n');
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, Buffer.from(signingInput));
  const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Token error: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

async function getSheetValues(sheetId, sheetName, token) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.values || [];
}

async function updateRow(sheetId, sheetName, rowIndex, values, token) {
  const range = `${sheetName}!A${rowIndex}:P${rowIndex}`;
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res   = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  });
  return await res.json();
}

async function appendRow(sheetId, sheetName, values, token) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}!A:P:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  });
  return await res.json();
}

async function ensureHistoricoSheet(sheetId, token) {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta   = await metaRes.json();
  const exists = meta.sheets?.some(s => s.properties.title === 'Histórico');

  if (!exists) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: 'Histórico' } } }] }),
    });
    await appendRow(sheetId, 'Histórico', [
      'Origem','SIAPE','Nome','CPF','Email','Telefone','Observações',
      'Cargo','Servidor/Pensionista','Situação funcional','Órgão',
      'Endereço','Cidade','UF','Data Atualização','Alterado por'
    ], token);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const sheetId     = process.env.SHEETS_ID;
    const token       = await getAccessToken(credentials);

    // Nova estrutura: row enviado pelo frontend
    // [origem, siape, nome, cpf, email, tel, obs, cargo, servPens, situacao, orgao, end, cidade, uf]
    const { row, alteradoPor = 'Usuário' } = req.body;

    if (!row || !Array.isArray(row) || !row[3]) {
      return res.status(400).json({ error: 'CPF obrigatório' });
    }

    const cpfNovo   = row[3].replace(/\D/g, '');
    const dataAgora = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // 1. Busca linha existente pelo CPF (coluna D = índice 3)
    const values      = await getSheetValues(sheetId, 'Sheet1', token);
    let foundRowIndex = -1;
    let existingRow   = [];

    for (let i = 1; i < values.length; i++) {
      const cpfExistente = (values[i][3] || '').replace(/\D/g, '');
      if (cpfExistente === cpfNovo) {
        foundRowIndex = i + 1; // Sheets é base 1
        existingRow   = values[i];
        break;
      }
    }

    // 2. Merge: campo em branco no formulário mantém valor existente
    const merged = row.map((newVal, idx) => {
      const existing = existingRow[idx] || '';
      return (newVal !== null && newVal !== undefined && String(newVal).trim() !== '')
        ? String(newVal).trim()
        : existing;
    });
    while (merged.length < 14) merged.push('');

    const finalRow = [...merged, dataAgora, alteradoPor];

    // 3. Atualiza linha existente ou insere nova
    if (foundRowIndex > 0) {
      await updateRow(sheetId, 'Sheet1', foundRowIndex, finalRow, token);
      console.log(`Atualizado: CPF ${cpfNovo} linha ${foundRowIndex} por ${alteradoPor}`);
    } else {
      await appendRow(sheetId, 'Sheet1', finalRow, token);
      console.log(`Inserido: CPF ${cpfNovo} por ${alteradoPor}`);
    }

    // 4. Registra no histórico
    await ensureHistoricoSheet(sheetId, token);
    await appendRow(sheetId, 'Histórico', finalRow, token);

    return res.status(200).json({
      success: true,
      action: foundRowIndex > 0 ? 'atualizado' : 'inserido',
      alteradoPor,
    });

  } catch (err) {
    console.error('Cadastro error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
