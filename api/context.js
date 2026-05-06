async function getAccessToken(credentials) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now    = Math.floor(Date.now() / 1000);
  const claim  = Buffer.from(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
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

async function listFiles(folderId, token) {
  // Busca txt, pdf, doc, docx, csv, planilhas Google
  const mimeFilter = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
  ].map(m => `mimeType='${m}'`).join(' or ');

  const query = encodeURIComponent(`'${folderId}' in parents and (${mimeFilter}) and trashed=false`);
  const url   = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&pageSize=30&orderBy=name`;

  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data.files || [];
}

async function readFile(file, token) {
  let url;
  const mime = file.mimeType;

  if (mime === 'application/vnd.google-apps.document') {
    url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
  } else if (mime === 'application/vnd.google-apps.spreadsheet') {
    url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/csv`;
  } else {
    // txt, csv, xlsx, doc — download direto
    url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  }

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const text = await res.text();

    // Verifica se o conteúdo é legível (não binário)
    // Rejeita se mais de 20% dos caracteres forem não-imprimíveis
    const nonPrintable = (text.match(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g) || []).length;
    const ratio = nonPrintable / text.length;
    if (ratio > 0.05) {
      console.log(`Arquivo ${file.name} ignorado — conteúdo binário (${(ratio*100).toFixed(0)}% não-imprimível)`);
      return null;
    }

    return text.slice(0, 15000); // até 15k chars por arquivo
  } catch (e) {
    console.warn(`Erro ao ler ${file.name}:`, e.message);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const folderId    = process.env.CONTEXT_FOLDER_ID || '1V9tGV_mR7_c0xNr4TOR1LoYbMX5dbJPu';
    const token       = await getAccessToken(credentials);

    const files = await listFiles(folderId, token);
    console.log('Arquivos de contexto encontrados:', files.map(f => f.name));

    const contents = [];
    for (const file of files) {
      const content = await readFile(file, token);
      if (content && content.trim()) {
        contents.push(`\n===== ARQUIVO: ${file.name} =====\n${content.trim()}`);
      }
    }

    const context = contents.join('\n\n');
    return res.status(200).json({
      success: true,
      filesRead: files.length,
      context: context || '',
    });

  } catch (err) {
    console.error('Context error:', err.message);
    return res.status(500).json({ error: err.message, context: '' });
  }
}
