// Faz o download de um arquivo do Drive pelo ID

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID do arquivo obrigatório' });

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const token       = await getAccessToken(credentials);

    // Busca metadados do arquivo
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?fields=name,mimeType`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const meta = await metaRes.json();
    if (!metaRes.ok) return res.status(404).json({ error: 'Arquivo não encontrado' });

    let downloadUrl;
    let contentType = meta.mimeType;

    // Google Docs/Sheets/Slides → exporta para formato comum
    if (meta.mimeType === 'application/vnd.google-apps.document') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (meta.mimeType === 'application/vnd.google-apps.spreadsheet') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (meta.mimeType === 'application/vnd.google-apps.presentation') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation`;
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else {
      // PDF, DOCX, etc — download direto
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
    }

    const fileRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!fileRes.ok) return res.status(502).json({ error: 'Erro ao baixar arquivo' });

    // Envia o arquivo para o navegador com header de download
    const fileName = encodeURIComponent(meta.name);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
    res.setHeader('Cache-Control', 'private, max-age=300');

    const buffer = await fileRes.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('Download error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
